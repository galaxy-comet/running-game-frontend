// "use strict";
// const { ethers } = require("ethers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const controller = {};
let users = [];

const checkUser = (socketId) => {
    return users.find(user => user.socketId == socketId);
}
const getUTCtimes = () => {
    var d = new Date();
    var currentdate = ('' + d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate());
    return currentdate;
}
controller.login = async (data, socketId) => {
    const db = global.db;
    let accountdata = data;
    let time = getUTCtimes();

    var result = await db.query("INSERT INTO users (address, date, level, socketID) VALUES('" + accountdata.account + "','" + getUTCtimes() + "',1,'" + socketId + "')");
    let newUser = {};
    newUser.socketId = socketId;
    newUser.address = accountdata.account;
    newUser.coin = 0;
    newUser.level = 1;
    users.push(newUser);
    return {
        success: 1,
    };
};

controller.disconnect = (_socketId) => {
    users = users.filter((user) => user.socketId != _socketId);
};

controller.addCoin = async (data, socketId) => {
    var user = checkUser(socketId);
    if (!user) throw new Error("Invalid request");
    user.coin += 1;
    const db = global.db;
    await db.query(
        "UPDATE users SET coins = '" +
        user.coin +
        "' WHERE socketID = '" +
        user.socketId +
        "'"
    );
    return user;
};
controller.addLevel = async (data, socketId) => {
    var user = checkUser(socketId);
    if (!user) throw new Error("Invalid request");
    user.level += 1;
    const db = global.db;
    await db.query(
        "UPDATE users SET level = '" +
        user.level +
        "' WHERE socketId = '" +
        user.socketId +
        "'"
    );
    return user;
};
controller.rewards = async (data, socketId) => {
    var user = checkUser(socketId);
    if (!user) throw new Error("Invalid request");
    const db = global.db;
    var user_result = await db.query("SELECT * FROM users WHERE socketID = '" + socketId + "'");
    return user_result;
};
controller.adminlogin = async (data, res) => {
    var admin_result = await db.query("SELECT * FROM admins WHERE name = '" + data.name + "'");
    if (admin_result.length > 0) {
        bcrypt.compare(String(data.pass), String(admin_result[0].pass)).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: admin_result[0].id,
                    name: admin_result[0].name,
                };
                jwt.sign(
                    payload,
                    "secret",
                    {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {
                        res.send({ type: "success", msg: "Success", token: token })
                    }
                );
            } else {
                res.send({ type: "fail", msg: "Incorrect Password" });
            }
        });
    }
    else {
        res.send({ type: "fail", msg: "Incorrect User" });
    }
};
controller.adminregister = async (data) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(data.pass, salt, (err, hash) => {
            if (err) throw err;
            let qu = "INSERT INTO admins (name, pass) VALUES('" + data.name + "', '" + hash + "');";
            db.query(qu)
        });
    });
};
controller.getsetting = async (data) => {
    var admin_result = await db.query("SELECT * FROM metaman_set");
    if (admin_result.length > 0) {
        data.send(admin_result[0]);
    }
    else {
        data.send({
            req_amount: 0,
            fee_amount: 0,
            reward_amount: 0
        });
    }
};
controller.setsetting = async (data) => {
    let save_data = data.data
    let result = await db.query("SELECT * FROM metaman_set");
    if (result.length > 0) {
        let result1 = await db.query("UPDATE metaman_set SET req_amount = " + save_data.req_amount + ", reward_amount = " + save_data.reward_amount + ", fee_amount = " + save_data.fee_amount + ";");
    }
    else {
        await db.query("INSERT INTO metaman_set (req_amount, fee_amount, reward_amount) VALUES('" + save_data.req_amount + "', '" + save_data.fee_amount + "','" + save_data.reward_amount + "')")
    }
    return 'success';
};
controller.emit = (socket) => {
    socket.emit("userslist", { users });
};

module.exports = {
    controller: controller,
    users: users,
};
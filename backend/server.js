require('dotenv').config()
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const express = require("express");
const app = express();
const http = require('http').createServer(app);
const https = require('https');
const { Server } = require("socket.io");
const io = new Server(http, { pingTimeout: 5000, pingInterval: 5000 });


var cors = require("cors");

const controller = require("./controllers/mycontrollers").controller;
let sockets = [];
const PORT = process.env.PORT || 80
// const HTTPSPORT = process.env.HTTPS_PORT || 443

const fileKey = __dirname + '/certs/privkey.pem'
const filePem = __dirname + '/certs/cert.pem'
let httpsServer = null
// let ioHttps = null
if (fs.existsSync(fileKey) && fs.existsSync(filePem)) {
    const key = fs.readFileSync(fileKey, 'utf8')
    const cert = fs.readFileSync(filePem, 'utf8')
    const options = { cert, key }
    httpsServer = https.createServer(options, app)
    // ioHttps = new Server(httpsServer, { pingTimeout: 5000, pingInterval: 5000 });
}

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.options("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    res.send(200);
});

const { connectDB } = require("./db");
db = connectDB({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

global.sql = db;

const rewards = require("./blockchainApis");

setInterval(() => {
    if (sockets.length > 0) {
        sockets.map((_socket) => {
            controller.emit(_socket);
        });
    }
}, 500);

// Implement socket functionality
const onConnection = (socket) => {
    console.log("socket connected: " + socket.id);
    // console.log(socket.handshake.address);

    let writedata = '' + socket.handshake.address + '  :  ' + new Date() + '\n';

    var logger = fs.createWriteStream('logs.txt', { flags: 'a' });
    logger.write(writedata);

    socket.on("disconnect", function () {
        console.log("disconnected");
        controller.disconnect(socket.id);
        sockets = sockets.filter((_socket) => {
            socket.id != _socket.id;
        });
        console.log('sockets  -  ', ...sockets);
        console.log('socket length   -   ', sockets.length);
    });
    socket.on("play", async (data) => {
        try {
            // console.log(data);
            var r = await controller.login(data, socket.id);
            if (r.success == 1) {
                sockets.push(socket);
            }
            socket.emit('playResponse', { resdata: r.success });
        } catch (err) {
        }
    });
    socket.on("addcoin", async (data) => {
        try {
            var r = await controller.addCoin(data, socket.id);
        } catch (err) {
        }
    });
    socket.on("addlevel", async (data) => {
        try {
            var r = await controller.addLevel(data, socket.id);
        } catch (err) {
        }
    });
    socket.on("receiveReward", async (data) => {
        try {
            var r = await controller.rewards(data, socket.id);
            // var datas = await controller.getsetting()
            if (r.level != 1 || r.length != 0) {
                var result = await rewards(r[0], 0.25, data.price);
                socket.emit('receiveRewardResponse', { result });
            }
            else {
                socket.emit('receiveRewardResponse', { result: false });
            }
            await controller.disconnect(socket.id);
        } catch (err) {

        }
    });
}

io.on("connection", onConnection);
// ioHttps.on("connection", onConnection);

app.use(express.static(__dirname + "/../build"));

app.use("/adminlogin", async function (req, res) {
    await controller.adminlogin(req.body, res);
    // await controller.adminregister(req.body);
});
app.use("/getsetting", async function (req, res) {
    await controller.getsetting(res);
});
app.use("/setsetting", async function (req, res) {
    // console.log(req.body);
    let result = await controller.setsetting(req.body);
    console.log(result);
    res.send(result);
});
app.get("*", function (req, res) {
    res.sendFile("index.html", { root: '../build' }, function (err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// httpsServer.listen(HTTPSPORT, () => console.log(`httpsServer running on port ${HTTPSPORT}`));
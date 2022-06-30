var mysql = require("mysql");
const util = require('util');

exports.connectDB = function (params) {
  var connection = mysql.createConnection(params);

  connection.connect(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Success!");
    }
  });

  connection.query("CREATE TABLE IF NOT EXISTS `metaman`.`users` ( \
    `id` INT(11) NOT NULL AUTO_INCREMENT, \
    `address` VARCHAR(200) NOT NULL, \
    `date` VARCHAR(50) NOT NULL, \
    `coins` INT(100) DEFAULT 0, \
    `level` INT(11) NOT NULL, \
    `flag` INT(2) DEFAULT 0, \
    `socketID` VARCHAR(50) NOT NULL,\
    PRIMARY KEY (`id`) ) ENGINE=INNODB CHARSET=utf8 COLLATE=utf8_general_ci");

  connection.query("CREATE TABLE IF NOT EXISTS `metaman`.`admins` ( \
    `id` INT(11) NOT NULL AUTO_INCREMENT, \
    `name` VARCHAR(200) NOT NULL, \
    `pass` VARCHAR(255) NOT NULL, \
    PRIMARY KEY (`id`) ) ENGINE=INNODB CHARSET=utf8 COLLATE=utf8_general_ci");
  connection.query("CREATE TABLE IF NOT EXISTS `metaman`.`metaman_set` ( \
      `id` INT(11) NOT NULL AUTO_INCREMENT, \
      `req_amount` FLOAT(11) default 0, \
      `reward_amount` FLOAT(11) default 0, \
      `fee_amount` FLOAT(11) default 0, \
      PRIMARY KEY (`id`) ) ENGINE=INNODB CHARSET=utf8 COLLATE=utf8_general_ci");
  connection.on("error", function onError(err) {
    console.log("db error", err);
  });

  return {
    query(sql, args) {
      return util.promisify(connection.query)
        .call(connection, sql, args);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    }
  };
};

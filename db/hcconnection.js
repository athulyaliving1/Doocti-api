const mysql = require("mysql");
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env file

const config = {
  mysql_pool: mysql.createPool({
    host: "162.241.123.158",
    user: "theatgg6_shg",
    password: "r3pbWhs8psb5nitZjlpDvg",
    database: "theatgg6_shc_branch288",
    multipleStatements: true,
  }),
};

module.exports = config;

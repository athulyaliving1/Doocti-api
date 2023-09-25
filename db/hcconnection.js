const mysql = require("mysql");
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env file

const config = {
  mysql_pool: mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_SHC,
    multipleStatements: true,
  }),
};

module.exports = config;

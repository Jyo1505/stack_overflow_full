

// const mysql = require("mysql2");
// const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require("./config");
// require("dotenv").config();

// const pool = mysql
//   .createPool({
//     host: "localhost",
//     user: "root",
//     password: "152005",
//     database: "socialapp",
//   })
//   .promise();

// module.exports = pool;

const { Pool } = require("pg");
const { DATABASE_URL } = require("./config");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;

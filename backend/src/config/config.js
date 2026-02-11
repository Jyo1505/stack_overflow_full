
// require("dotenv").config();

// module.exports = {
//   PORT: process.env.PORT || 5000,
//   DB_HOST: process.env.DB_HOST || "localhost",
//   DB_USER: process.env.DB_USER || "root",
//   DB_PASSWORD: process.env.DB_PASSWORD || "152005",
//   DB_NAME: process.env.DB_NAME || "socialapp",
//   JWT_SECRET: process.env.JWT_SECRET || "mySuperSecretKey123",
// };


require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};



require('dotenv').config();
console.log("Sequelize CLI NODE_ENV:", process.env.NODE_ENV);
module.exports = {
  [process.env.NODE_ENV || 'development']: {
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV !== 'prod'
  }
};
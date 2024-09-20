const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../', '.env') })
module.exports = {
  ENV: process.env.ENV,
  HOST: process.env.HOST,
  SDK_PORT: process.env.SDK_PORT,
  SECRET: process.env.SECRET,
  SETUP: process.env.SETUP,
  DISCOVERY_AS_LOCALHOST: process.env.DISCOVERY_AS_LOCALHOST,
  MONGODB_HOST: process.env.MONGODB_HOST,
  MONGODB_NAME: process.env.MONGODB_NAME,
  MONGODB_USERNAME: process.env.MONGODB_USERNAME,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
  DB_CONNECTION_STRING: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`,
}

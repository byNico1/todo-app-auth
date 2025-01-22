import pg from "pg";
const { Pool } = pg;
import "dotenv/config";

// All of the following properties should be read from environment variables
// We're hardcoding them here for simplicity
export default new Pool({
  host: process.env.HOST, // or wherever the db is hosted
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  database: process.env.DB,
});

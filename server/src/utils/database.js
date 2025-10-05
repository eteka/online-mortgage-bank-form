import mysql from 'mysql2/promise'
import { env } from './env.js'

const poolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0
}

if (env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false }
}

export const pool = mysql.createPool(poolConfig)

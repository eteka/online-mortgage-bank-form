import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DB_HOST: z.string({ required_error: 'DB_HOST is required' }),
  DB_PORT: z.coerce.number().int().positive().max(65535).default(3306),
  DB_USER: z.string({ required_error: 'DB_USER is required' }),
  DB_PASSWORD: z.string({ required_error: 'DB_PASSWORD is required' }),
  DB_NAME: z.string({ required_error: 'DB_NAME is required' }),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().max(50).default(10),
  DB_SSL: z.enum(['true', 'false']).default('false')
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment configuration. Please review your environment variables.')
}

export const env = parsed.data

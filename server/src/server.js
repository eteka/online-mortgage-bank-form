import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'

import { env } from './utils/env.js'
import { errorHandler } from './middleware/error-handler.js'
import registrationRouter from './routes/registration.js'

const app = express()

app.set('trust proxy', 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(hpp())

app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/', apiLimiter)

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production'
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() })
})

app.use('/api/registration', csrfProtection, registrationRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(errorHandler)

export default app

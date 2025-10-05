import app from './server.js'
import { env } from './utils/env.js'

const port = env.PORT

app.listen(port, () => {
  console.log(`Secure mortgage form API listening on port ${port}`)
})

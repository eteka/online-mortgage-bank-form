export function errorHandler (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Security token mismatch. Please refresh and try again.' })
  }

  if (err.status && err.message) {
    return res.status(err.status).json({ message: err.message })
  }

  console.error('Unexpected error', err)
  return res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' })
}

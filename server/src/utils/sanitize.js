import xss from 'xss'

export const sanitizePayload = (payload) => {
  const sanitised = {}
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      sanitised[key] = xss(value.trim())
    } else {
      sanitised[key] = value
    }
  }
  return sanitised
}

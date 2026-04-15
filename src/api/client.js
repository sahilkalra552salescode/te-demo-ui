import axios from 'axios'

// Frontend calls backend directly (Railway in prod, localhost in dev).
// SalesHub opens this web app as a URL and passes ?tenantId=xxx.
// X-Service-Key is a shared secret stored in env vars.

const API_BASE    = import.meta.env.VITE_API_BASE    || 'http://localhost:8083'
const SERVICE_KEY = import.meta.env.VITE_SERVICE_KEY || 'secret'

export function createApiClient(tenantId) {
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type':  'application/json',
      'X-Tenant-Id':   tenantId,
      'X-Service-Key': SERVICE_KEY,
    },
  })
}

export const adminClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

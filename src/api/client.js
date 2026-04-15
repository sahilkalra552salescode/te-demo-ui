import axios from 'axios'

// Production flow:
//   Frontend → SalesHub proxy (/plugins/{uuid}/api/...) with Authorization + X-Tenant-Id
//   SalesHub → Our backend with X-Tenant-Id forwarded + X-Service-Key injected from plugin config
//
// Frontend never sets X-Service-Key — that's SalesHub's job (plugin auth config).
// Frontend sets X-Tenant-Id so SalesHub enforces RLS and forwards it to our backend.
//
// Dev flow (VITE_DEV=true): call our backend directly with both headers set manually.

const IS_DEV = import.meta.env.DEV

const SALESHUB_PROXY_BASE  = import.meta.env.VITE_SALESHUB_PROXY_BASE  || ''  // e.g. https://api.salescodeai.com/plugins/{uuid}/api
const SALESHUB_JWT         = import.meta.env.VITE_SALESHUB_JWT          || ''  // dev-only static JWT
const DEV_API_BASE         = import.meta.env.VITE_DEV_API_BASE          || 'http://localhost:8083'
const DEV_TENANT_ID        = import.meta.env.VITE_DEV_TENANT_ID         || ''
const DEV_SERVICE_KEY      = import.meta.env.VITE_DEV_SERVICE_KEY       || 'secret'

export function createApiClient(tenantId) {
  if (IS_DEV) {
    // Dev: call backend directly, simulate what SalesHub would inject
    return axios.create({
      baseURL: DEV_API_BASE,
      headers: {
        'Content-Type':  'application/json',
        'X-Tenant-Id':   tenantId || DEV_TENANT_ID,
        'X-Service-Key': DEV_SERVICE_KEY,
      },
    })
  }

  // Production: call through SalesHub proxy
  // SalesHub injects X-Service-Key; we only set Authorization + X-Tenant-Id
  return axios.create({
    baseURL: SALESHUB_PROXY_BASE,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SALESHUB_JWT}`,
      'X-Tenant-Id':   tenantId,
    },
  })
}

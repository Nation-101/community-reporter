import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Device ID Management (Anonymous Identity) ───

export const getDeviceId = () => {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('device_id', id)
  }
  return id
}

// Call this before any query that filters by device_id
export const setDeviceContext = async () => {
  const deviceId = getDeviceId()
  await supabase.rpc('set_app_device_id', { device_id: deviceId })
  return deviceId
}
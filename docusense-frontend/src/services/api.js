const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isFormData && body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),

  getDocuments: (token) => request('/api/documents', { token }),

  uploadDocument: (file, token) => {
    const formData = new FormData()
    formData.append('file', file)
    return request('/api/documents/upload', {
      method: 'POST',
      body: formData,
      token,
      isFormData: true,
    })
  },

  analyzeDocument: (docId, token) =>
    request(`/api/documents/${docId}/analyze`, { method: 'POST', token }),

  deleteDocument: (docId, token) =>
    request(`/api/documents/${docId}`, { method: 'DELETE', token }),
}

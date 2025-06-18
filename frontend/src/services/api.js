import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  const apiKey = localStorage.getItem('apiKey')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (apiKey) {
    config.params = {
      ...config.params,
      api_id: apiKey,
      v: '1'
    }
  }
  
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    throw error
  }
)

const apiService = {
  // Requests
  getRequests: () => api.get('/requests/search', { data: { token_ids: [] } }),
  createRequest: (requestData) => api.post('/requests', { request: requestData }),
  getRequest: (id, tokenId) => api.get(`/requests/${id}?token_id=${tokenId}`),
  updateRequest: (id, data, tokenId) => api.put(`/requests/${id}?token_id=${tokenId}`, { request: data }),
  deleteRequest: (id, tokenId, remoteUser) => api.delete(`/requests/${id}?token_id=${tokenId}`, { remote_user: remoteUser }),

  // Tokens
  createTokens: (requestIds) => api.post('/requests/tokens', { request_ids: requestIds }),
  deleteToken: (tokenId) => api.delete(`/requests/tokens/${tokenId}`),

  // Request Pages
  getRequestPage: (id, tokenId) => api.get(`/request-pages/${id}?token_id=${tokenId}`),
}

export default apiService
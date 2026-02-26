import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Repos
export const reposAPI = {
  index: (data) => api.post('/repos/index', data),
  list: () => api.get('/repos/'),
  get: (id) => api.get(`/repos/${id}`),
  delete: (id) => api.delete(`/repos/${id}`),
}

// Chat
export const chatAPI = {
  ask: (data) => api.post('/chat/ask', data),
  history: (repoId) => api.get(`/chat/history/${repoId}`),
  clearHistory: (repoId) => api.delete(`/chat/history/${repoId}`),
}

export default api

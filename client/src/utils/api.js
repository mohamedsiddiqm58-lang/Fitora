const BASE_URL = '/api';

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('fitora_token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('fitora_token');
        localStorage.removeItem('fitora_user');
      }
      throw new Error(result.message || `Request failed with status ${response.status}`);
    }

    return result;
  } catch (err) {
    console.error(`API Error on ${method} ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, 'GET'),
  post: (endpoint, data) => apiRequest(endpoint, 'POST', data),
  put: (endpoint, data) => apiRequest(endpoint, 'PUT', data),
  patch: (endpoint, data) => apiRequest(endpoint, 'PATCH', data),
  delete: (endpoint) => apiRequest(endpoint, 'DELETE')
};

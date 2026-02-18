import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// withCredentials ensures the browser sends httpOnly cookies on every request
const baseApi = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// On 401, attempt a silent token refresh once, then redirect to login
baseApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // POST /auth/refresh – the refreshToken cookie is sent automatically
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        // New accessToken cookie is now set – retry the original request
        return baseApi(original);
      } catch (_err) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default baseApi;

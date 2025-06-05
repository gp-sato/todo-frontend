import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: 'http://localhost:80',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const xsrfToken = Cookies.get('XSRF-TOKEN');
  if (xsrfToken && config.headers) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  return config;
});

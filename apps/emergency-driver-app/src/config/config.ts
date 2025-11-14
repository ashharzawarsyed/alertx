export const API_URL = __DEV__ 
  ? 'http://localhost:5000/api/v1' 
  : 'https://your-production-api.com/api/v1';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://your-production-api.com';

export default {
  API_URL,
  SOCKET_URL,
};

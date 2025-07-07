// Environment configuration using Vite environment variables
const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'BlogSphere',
  NODE_ENV: import.meta.env.MODE || 'development'
};

console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', config.API_BASE_URL);
console.log('App Name:', config.APP_NAME);

export default config;

// Environment configuration for different deployment environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api'
  },
  production: {
    API_BASE_URL: 'https://blog-website-backend-5neq.onrender.com/api'
  }
};

const environment = import.meta.env.MODE || 'development';
export default config[environment];

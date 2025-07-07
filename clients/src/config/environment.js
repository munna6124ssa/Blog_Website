// Environment configuration for different deployment environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api'
  },
  production: {
    API_BASE_URL: 'https://your-backend-url.herokuapp.com/api' // Update this when you deploy backend
  }
};

const environment = import.meta.env.MODE || 'development';
export default config[environment];

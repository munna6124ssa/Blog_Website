// Environment configuration for different deployment environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api'
  },
  production: {
    API_BASE_URL: 'https://blog-website-backend-5neq.onrender.com/api'
  }
};

// Better environment detection
const environment = import.meta.env.MODE || 
                   (window.location.hostname === 'localhost' ? 'development' : 'production');

console.log('Environment detected:', environment);
console.log('API URL:', config[environment].API_BASE_URL);

export default config[environment];

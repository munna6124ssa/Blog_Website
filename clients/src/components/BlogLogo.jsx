const BlogLogo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
      </defs>
      
      {/* Outer Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#blogGradient)" opacity="0.9"/>
      
      {/* Inner Content - Stylized "B" for Blog */}
      <path 
        d="M25 20 L25 80 L55 80 C65 80 72 73 72 63 C72 58 69 54 65 52 C69 50 72 46 72 40 C72 30 65 20 55 20 L25 20 Z M35 30 L50 30 C55 30 58 33 58 38 C58 43 55 46 50 46 L35 46 L35 30 Z M35 54 L52 54 C58 54 62 58 62 63 C62 68 58 72 52 72 L35 72 L35 54 Z" 
        fill="white" 
        opacity="0.95"
      />
      
      {/* Decorative dots */}
      <circle cx="80" cy="25" r="3" fill="white" opacity="0.7"/>
      <circle cx="85" cy="35" r="2" fill="white" opacity="0.5"/>
      <circle cx="20" cy="25" r="2" fill="white" opacity="0.6"/>
    </svg>
  );
};

export default BlogLogo;

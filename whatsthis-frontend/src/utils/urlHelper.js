export const getFullImageUrl = (path) => {
  if (!path) return "https://www.gravatar.com/avatar/default?d=mp";
  if (path.startsWith('http')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const cleanPath = path.replace(/^\/+|^uploads\/+|uploads\//g, '');
  
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${apiBaseUrl}/api/uploads/${cleanPath}`;
};

export const getApiUrl = (endpoint) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.171.227.193:8080';
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiBaseUrl}/api/${cleanEndpoint}`;
}; 
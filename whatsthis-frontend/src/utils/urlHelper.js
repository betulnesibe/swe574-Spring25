export const getFullImageUrl = (path) => {
  // Handle null, undefined or empty string
  if (!path) return "https://www.gravatar.com/avatar/default?d=mp";
  
  // If already a full URL, return as is
  if (path.startsWith('http')) return path;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  // Extract just the filename, regardless of how it's formatted
  let filename = path;
  
  // Handle various path formats
  if (path.includes('/')) {
    const lastSlashIndex = path.lastIndexOf('/');
    filename = path.substring(lastSlashIndex + 1);
  }
  
  // Ensure we don't have duplicate /api/ in the URL
  const apiBase = baseUrl.endsWith('/api') 
    ? baseUrl 
    : `${baseUrl}/api`;
  
  // Return the fully formed URL
  return `${apiBase}/uploads/${filename}`;
};

export const getApiUrl = (endpoint) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${apiBaseUrl}/${cleanEndpoint}`;
}; 
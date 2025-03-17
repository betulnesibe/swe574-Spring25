import axiosInstance from './axiosInstance';

const getAllPosts = async (page = 1, size = 12, sortBy = "newest") => {
  try {
    const response = await axiosInstance.get('/posts/paginated', {
      params: {
        page: page - 1,
        size,
        sort: sortBy
      }
    });
    const data = response.data;
    return {
      posts: data.content || [],
      totalPages: data.totalPages || 1,
      currentPage: data.number + 1 || 1,
      totalElements: data.totalElements || 0
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const getPostById = async (id) => {
  try {
    console.log(`Fetching post with id ${id}`);
    const response = await axiosInstance.get(`/posts/${id}`);
    const postData = response.data;
    
    // Better debug logging for parts
    console.log('Raw post data received:', postData);
    
    // Ensure parts property exists and is an array
    if (!postData.parts) {
      postData.parts = [];
      console.log('Parts property was missing - initialized as empty array');
    } else if (!Array.isArray(postData.parts)) {
      console.log('Parts is not an array, converting:', postData.parts);
      // If parts exists but is not an array, try to handle it
      try {
        if (typeof postData.parts === 'string') {
          postData.parts = JSON.parse(postData.parts);
        }
        if (!Array.isArray(postData.parts)) {
          postData.parts = [postData.parts]; // Convert single object to array
        }
      } catch (e) {
        console.error('Error processing parts data:', e);
        postData.parts = [];
      }
    }
    
    console.log(`Received ${postData.parts.length} parts from API:`, postData.parts);
    return postData;
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw error;
  }
};

const createPost = async (formData) => {
  try {
    const response = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    window.location.href = '/';
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

const votePost = async (postId, userId, voteType) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/${voteType}`, { userId });
    return response.data;
  } catch (error) {
    console.error(`Error ${voteType}ing post:`, error);
    throw error;
  }
};

const getUserVote = async (postId, userId) => {
  try {
    const response = await axiosInstance.get(`/posts/${postId}/vote/${userId}`);
    return response.data.voteType;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
};

const searchPosts = async (searchParams) => {
  try {
    const queryString = Object.entries(searchParams)
      .filter(([_, value]) => value !== '' && value !== false)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const response = await axiosInstance.get(`/posts/search?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

const toggleSolution = async (postId, commentId, isRemoving) => {
  try {
    const endpoint = isRemoving 
      ? `/posts/${postId}/solution/remove`
      : `/posts/${postId}/solution/${commentId}`;
    
    const response = await axiosInstance.post(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error toggling solution:', error);
    throw error;
  }
};

const getTagDetails = async (tagId) => {
  try {
    const response = await axiosInstance.get(`/tags/search?query=${encodeURIComponent(tagId)}`);
    const exactMatch = response.data.find(tag => 
      tag.id === tagId || 
      tag.name === tagId || 
      tag.label === tagId
    );
    return exactMatch ? [exactMatch] : [];
  } catch (error) {
    console.error('Error fetching tag details:', error);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axiosInstance.delete(`/posts/${postId}`);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export default {
  getAllPosts,
  getPostById,
  createPost,
  votePost,
  getUserVote,
  searchPosts,
  toggleSolution,
  getTagDetails,
  deletePost,
};

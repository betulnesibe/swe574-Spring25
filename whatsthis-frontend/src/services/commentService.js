import axiosInstance from './axiosInstance';

export const getCommentsByPostId = async (postId) => {
  try {
    const response = await axiosInstance.get(`/comments/posts/${postId}/comments`);
    return response.data._embedded?.commentDtoes || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (commentData) => {
  try {
    const response = await axiosInstance.post('/comments', commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getUserComments = async (userId) => {
  try {
    const response = await axiosInstance.get(`/comments/user/${userId}`);
    return response.data._embedded?.commentDtoes || response.data;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return [];
  }
};

export const toggleSolution = async (postId, commentId, isRemoving) => {
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

export default {
  getCommentsByPostId,
  addComment,
  getUserComments,
  toggleSolution,
};

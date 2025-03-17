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
    // Default values for new fields if not provided
    const enhancedCommentData = {
      ...commentData,
      commentType: commentData.commentType || 'GENERAL',
      confidenceLevel: commentData.confidenceLevel || null,
      referenceLinks: commentData.referenceLinks || []
    };
    
    // Log the data we're sending
    console.log('Sending comment data to server:', enhancedCommentData);
    
    const response = await axiosInstance.post('/comments', enhancedCommentData);
    console.log('Server response for comment:', response.data);
    
    // Check if the comment was saved but the images were not processed
    if (response.data && 
        enhancedCommentData.imageUrls && 
        enhancedCommentData.imageUrls.length > 0 && 
        (!response.data.imageUrls || response.data.imageUrls.length === 0)) {
      console.warn('Comment was saved but images may not have been processed. The comment will appear without images.');
    }
    
    return response.data;
  } catch (error) {
    // Check if this is a 500 error with a successful response body
    // (which might indicate partial success)
    if (error.response?.status === 500 && error.response?.data?.id) {
      console.warn('Comment might have been created but encountered an error with images');
      return error.response.data;
    }
    
    console.error('Error adding comment:', error);
    console.error('Error response:', error.response?.data);
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

export const upvoteComment = async (commentId, userId = null) => {
  try {
    const url = userId ? 
      `/comments/${commentId}/upvote?userId=${userId}` : 
      `/comments/${commentId}/upvote`;
      
    const response = await axiosInstance.post(url);
    return response.data;
  } catch (error) {
    console.error('Error upvoting comment:', error);
    throw error;
  }
};

export const downvoteComment = async (commentId, userId = null) => {
  try {
    const url = userId ? 
      `/comments/${commentId}/downvote?userId=${userId}` : 
      `/comments/${commentId}/downvote`;
      
    const response = await axiosInstance.post(url);
    return response.data;
  } catch (error) {
    console.error('Error downvoting comment:', error);
    throw error;
  }
};

// Comment types and confidence levels constants
export const COMMENT_TYPES = {
  IDENTIFICATION: 'IDENTIFICATION',
  ADDITIONAL_INFO: 'ADDITIONAL_INFO',
  CORRECTION: 'CORRECTION',
  REQUEST_INFO: 'REQUEST_INFO',
  GENERAL: 'GENERAL'
};

export const CONFIDENCE_LEVELS = {
  MAYBE: 'MAYBE',
  LIKELY: 'LIKELY',
  VERY_CONFIDENT: 'VERY_CONFIDENT'
};

export default {
  getCommentsByPostId,
  addComment,
  getUserComments,
  toggleSolution,
  upvoteComment,
  downvoteComment,
  COMMENT_TYPES,
  CONFIDENCE_LEVELS
};

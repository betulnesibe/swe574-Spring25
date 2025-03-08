import commentService from '../commentService';
import axiosInstance from '../axiosInstance';

jest.mock('../axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCommentsByPostId fetches comments correctly', async () => {
    const mockComments = [
      { id: 1, text: 'Test Comment', userId: 1 }
    ];
    axiosInstance.get.mockResolvedValueOnce({ 
      data: { _embedded: { commentDtoes: mockComments } }
    });

    const result = await commentService.getCommentsByPostId(1);
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/comments/posts/1/comments');
    expect(result).toEqual(mockComments);
  });

  test('addComment sends correct data', async () => {
    const newComment = {
      postId: 1,
      text: 'New Comment',
      userId: 2
    };
    axiosInstance.post.mockResolvedValueOnce({ data: { id: 1, ...newComment } });

    await commentService.newComment(newComment);
    
    expect(axiosInstance.post).toHaveBeenCalledWith('/comments', newComment);
  });
}); 
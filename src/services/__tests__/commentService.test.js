import commentService from '../commentService';
import axiosInstance from '../axiosInstance';

jest.mock('../axiosInstance');

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCommentsByPostId fetches comments correctly', async () => {
    const mockComments = [
      { id: 1, text: 'Test Comment', userId: 1 }
    ];
    axiosInstance.get.mockResolvedValueOnce({ data: mockComments });

    const result = await commentService.getCommentsByPostId(1);
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/posts/1/comments');
    expect(result).toEqual(mockComments);
  });

  test('createComment sends correct data', async () => {
    const newComment = {
      postId: 1,
      text: 'New Comment',
      userId: 2
    };
    axiosInstance.post.mockResolvedValueOnce({ data: { id: 1, ...newComment } });

    await commentService.createComment(newComment);
    
    expect(axiosInstance.post).toHaveBeenCalledWith('/comments', newComment);
  });
}); 
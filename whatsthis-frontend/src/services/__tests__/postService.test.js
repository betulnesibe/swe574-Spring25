import postService from '../postService';
import axiosInstance from '../axiosInstance';

jest.mock('../axiosInstance', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('postService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getPostById fetches post correctly', async () => {
    const mockPost = {
      id: 1,
      title: 'Test Post',
      description: 'Test Description'
    };
    axiosInstance.get.mockResolvedValueOnce({ data: mockPost });

    const result = await postService.getPostById(1);
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/posts/1');
    expect(result).toEqual(mockPost);
  });

  test('votePost sends correct vote data', async () => {
    const postId = 1;
    const userId = 2;
    const voteType = 'upvote';
    axiosInstance.post.mockResolvedValueOnce({ data: {} });

    await postService.votePost(postId, userId, voteType);
    
    expect(axiosInstance.post).toHaveBeenCalledWith(`/posts/${postId}/${voteType}`, { userId });
  });

  test('getUserVote fetches vote correctly', async () => {
    const mockVote = { voteType: 'upvote' };
    axiosInstance.get.mockResolvedValueOnce({ data: mockVote });

    const result = await postService.getUserVote(1, 2);
    
    expect(axiosInstance.get).toHaveBeenCalledWith('/posts/1/vote/2');
    expect(result).toEqual(mockVote.voteType);
  });
}); 
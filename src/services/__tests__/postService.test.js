import postService from '../postService';
import axiosInstance from '../axiosInstance';

jest.mock('../axiosInstance');

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

  test('createPost sends correct data', async () => {
    const newPost = {
      title: 'New Post',
      description: 'Description',
      tags: ['test']
    };
    axiosInstance.post.mockResolvedValueOnce({ data: { id: 1, ...newPost } });

    await postService.createPost(newPost);
    
    expect(axiosInstance.post).toHaveBeenCalledWith('/posts', newPost);
  });

  test('votePost sends correct vote data', async () => {
    const postId = 1;
    const userId = 2;
    const voteType = 'upvote';

    await postService.votePost(postId, userId, voteType);
    
    expect(axiosInstance.post).toHaveBeenCalledWith(`/posts/${postId}/vote`, {
      userId,
      voteType
    });
  });
}); 
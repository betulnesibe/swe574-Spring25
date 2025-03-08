import '@testing-library/jest-dom';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => ''
}));

jest.mock('@/context/UserContext', () => ({
  UserContext: {
    Provider: ({ children }) => children
  },
  UserProvider: ({ children }) => children,
  useUser: () => ({
    user: { id: 1, username: 'testuser' },
    token: 'mock-token',
    login: jest.fn(),
    logout: jest.fn(),
    setUser: jest.fn(),
    setToken: jest.fn()
  })
}));

jest.mock('@/services/postService', () => ({
  getPostById: jest.fn(),
  getUserVote: jest.fn(),
  votePost: jest.fn(),
  createPost: jest.fn(),
  getTagDetails: jest.fn(),
}));

jest.mock('@/services/commentService', () => ({
  getCommentsByPostId: jest.fn(),
  createComment: jest.fn()
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.fetch = jest.fn();
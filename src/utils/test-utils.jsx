import React from 'react';
import { render } from '@testing-library/react';
import { UserContext } from '@/context/UserContext';

const mockUserContext = {
  user: { id: 1, username: 'testuser' },
  login: jest.fn(),
  logout: jest.fn(),
  token: 'mock-token',
  setUser: jest.fn(),
  setToken: jest.fn()
};

const customRender = (ui, { userContext = mockUserContext, ...options } = {}) => {
  const Wrapper = ({ children }) => (
    <UserContext.Provider value={userContext}>
      {children}
    </UserContext.Provider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render }; 
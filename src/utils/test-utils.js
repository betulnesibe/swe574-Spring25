import React from 'react';
import { render } from '@testing-library/react';
import { UserProvider } from '@/context/UserContext';

const AllTheProviders = ({ children }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render }; 
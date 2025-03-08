"use client";

import { useState } from "react";
import NavigationBar from '../components/NavigationBar';
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal"; 

export default function ClientLayout({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isSignupOpen, setSignupOpen] = useState(false);

  const openLoginModal = () => setLoginOpen(true);
  const closeLoginModal = () => setLoginOpen(false);

  const openSignupModal = () => setSignupOpen(true);
  const closeSignupModal = () => setSignupOpen(false);

  const handleSearch = (searchParams) => {
    if (typeof window !== 'undefined' && window._handleSearch) {
      window._handleSearch(searchParams);
    }
  };

  return (
    <>
      <NavigationBar 
        onOpenLogin={openLoginModal} 
        onOpenSignup={openSignupModal}
        onSearch={handleSearch}
      />
      {isLoginOpen && <LoginModal onClose={closeLoginModal} />}
      {isSignupOpen && <SignupModal onClose={closeSignupModal} />}

      <main>{children}</main>
    </>
  );
} 
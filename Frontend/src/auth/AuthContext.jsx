import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Placeholder Client ID - User needs to replace this
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = loading/landing, 'guest' = guest mode, object = logged in

  // Check localStorage for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('sidera_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        isGuest: false,
        token: credentialResponse.credential
      };
      setUser(userData);
      localStorage.setItem('sidera_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Login Failed", error);
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      name: "Traveller",
      picture: null,
      isGuest: true
    };
    setUser(guestUser);
    // Do NOT save guest to local storage if we want them to re-login on refresh? 
    // Or save for convenience? User said "Guest.. but DB save X". 
    // Local persistence is fine.
    localStorage.setItem('sidera_user', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sidera_user');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export const useAuth = () => useContext(AuthContext);

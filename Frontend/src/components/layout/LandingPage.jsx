import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../auth/AuthContext';
import { Sparkles, UserRound } from 'lucide-react';

export default function LandingPage() {
  const { login, loginAsGuest } = useAuth();

  return (
    <div className="h-screen w-full bg-[#050510] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050510] to-[#050510]" />

      {/* Content */}
      <div className="z-10 text-center space-y-8 p-8 max-w-md w-full backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-500/20 rounded-full animate-pulse">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Sidera
          </h1>
          <p className="text-gray-400 text-lg">
            Navigate your thoughts among the stars.
          </p>
        </div>

        <div className="space-y-4 pt-8">
          {/* Google Login Wrapper */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={login}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="pill"
              width="100%"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0b1026] px-2 text-gray-500">Or continue as</span>
            </div>
          </div>

          <button
            onClick={loginAsGuest}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-600 hover:bg-white/10 transition-colors text-gray-300 font-medium"
          >
            <UserRound size={18} />
            Guest Traveller
          </button>

          <p className="text-xs text-gray-600 mt-4">
            Guest data is volatile and will not be saved to the database.
          </p>
        </div>
      </div>
    </div>
  );
}

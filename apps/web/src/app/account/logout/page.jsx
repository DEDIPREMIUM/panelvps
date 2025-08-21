"use client";

import { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { Server, LogOut, Check } from "lucide-react";

function MainComponent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
      setSuccess(true);
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-poppins font-semibold text-2xl text-white text-opacity-87 mb-2">
            Sign Out
          </h1>
          <p className="text-white text-opacity-60 text-sm">
            Securely end your admin session
          </p>
        </div>

        {/* Logout Form */}
        <div className="bg-[#1E1E1E] rounded-[16px] p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white text-opacity-87 mb-2">
                  Signed Out Successfully
                </h3>
                <p className="text-sm text-white text-opacity-60 mb-6">
                  Your admin session has been terminated securely.
                </p>
              </div>
              <a
                href="/account/signin"
                className="inline-block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] text-center"
              >
                Sign In Again
              </a>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center mx-auto">
                <LogOut className="w-8 h-8 text-orange-400" />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white text-opacity-87 mb-2">
                  End Admin Session?
                </h3>
                <p className="text-sm text-white text-opacity-60">
                  You will be logged out of your VPS management dashboard and
                  need to sign in again to access admin features.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mr-2"></div>
                      Signing Out...
                    </div>
                  ) : (
                    "Yes, Sign Out"
                  )}
                </button>

                <a
                  href="/"
                  className="block w-full bg-[#2A2A2A] hover:bg-[#333] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] text-center"
                >
                  Cancel
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white text-opacity-40">
            🔒 Session will be terminated on all devices
          </p>
        </div>
      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;

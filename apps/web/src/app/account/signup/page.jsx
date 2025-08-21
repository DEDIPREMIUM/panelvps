"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Server, Lock, Mail, User } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
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
            Create Admin Account
          </h1>
          <p className="text-white text-opacity-60 text-sm">
            Setup your VPS management dashboard
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={onSubmit} className="bg-[#1E1E1E] rounded-[16px] p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white text-opacity-87">
                Admin Email
              </label>
              <div className="relative">
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white text-opacity-87 placeholder-white placeholder-opacity-60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white text-opacity-40" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white text-opacity-87">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white text-opacity-87 placeholder-white placeholder-opacity-60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Lock className="absolute right-3 top-3 w-5 h-5 text-white text-opacity-40" />
              </div>
              <p className="text-xs text-white text-opacity-60">
                Use at least 8 characters with a mix of letters and numbers
              </p>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Admin Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-white text-opacity-60 text-sm">
                Already have access?{" "}
                <a
                  href={`/account/signin${
                    typeof window !== "undefined" ? window.location.search : ""
                  }`}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 bg-[#1A1A1A] border border-gray-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white text-opacity-87 mb-1">
                Admin Account Security
              </h3>
              <p className="text-xs text-white text-opacity-60">
                This account will have full access to your VPS management
                dashboard. Keep your credentials secure and don't share with
                unauthorized users.
              </p>
            </div>
          </div>
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

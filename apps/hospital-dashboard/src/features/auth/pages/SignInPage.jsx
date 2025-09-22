import { Eye, EyeSlash, ShieldCheck } from "phosphor-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

const SignInPage = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signin(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Aesthetic Background Pattern */}
        <div className="absolute inset-0">
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/30 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/10 via-transparent to-blue-400/10"></div>

          {/* Floating Geometric Shapes */}
          <div className="absolute top-16 left-16 w-28 h-28 bg-white/8 rounded-full backdrop-blur-sm border border-white/10"></div>
          <div className="absolute top-32 right-24 w-20 h-20 bg-white/12 rounded-2xl rotate-45 backdrop-blur-sm border border-white/15"></div>
          <div className="absolute bottom-24 left-24 w-16 h-16 bg-white/8 rounded-full backdrop-blur-sm border border-white/10"></div>
          <div className="absolute bottom-16 right-16 w-12 h-12 bg-white/12 rounded-xl rotate-12 backdrop-blur-sm border border-white/15"></div>

          {/* Medical Cross Icons Scattered */}
          <div className="absolute top-1/3 right-1/3 w-6 h-6 opacity-15">
            <div className="w-full h-1 bg-white rounded absolute top-1/2 transform -translate-y-1/2"></div>
            <div className="h-full w-1 bg-white rounded absolute left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 opacity-10">
            <div className="w-full h-0.5 bg-white rounded absolute top-1/2 transform -translate-y-1/2"></div>
            <div className="h-full w-0.5 bg-white rounded absolute left-1/2 transform -translate-x-1/2"></div>
          </div>

          {/* Subtle Dot Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
          <div className="text-center max-w-lg">
            {/* Enhanced Icon/Logo Section */}
            <div className="mb-8">
              <div className="relative mx-auto w-24 h-24 mb-6">
                {/* Glass morphism container */}
                <div className="absolute inset-0 bg-white/15 rounded-3xl backdrop-blur-lg border border-white/20 shadow-2xl"></div>
                <div className="absolute inset-3 flex items-center justify-center">
                  <svg
                    viewBox="0 0 60 60"
                    className="w-full h-full text-white drop-shadow-lg"
                  >
                    <rect
                      x="7"
                      y="27"
                      width="46"
                      height="6"
                      rx="3"
                      fill="currentColor"
                    />
                    <rect
                      x="27"
                      y="7"
                      width="6"
                      height="46"
                      rx="3"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div>
              </div>
            </div>

            {/* Main Heading with Beautiful Typography */}
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Join AlertX
              </span>
              <span className="block bg-gradient-to-r from-blue-50 via-white to-indigo-50 bg-clip-text text-transparent drop-shadow-2xl mt-1">
                Network
              </span>
            </h1>

            {/* Elegant Subtitle */}
            <p className="text-lg lg:text-xl font-medium text-blue-50/90 mb-8 leading-relaxed tracking-wide max-w-md mx-auto">
              Register your hospital and become part of the most advanced
              emergency response system
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-6 opacity-80">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">24/7</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Emergency Ready
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Smart System
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">+</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Healthcare Plus
                </p>
              </div>
            </div>

            {/* Welcome Back Message */}
            <div className="mt-8 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <p className="text-blue-100 text-sm font-medium">
                Welcome back to your healthcare management dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-slate-50 to-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div>
            <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sign In
            </h2>
            <p className="text-gray-600 mb-10 text-lg font-medium">
              Access your hospital dashboard
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="hospital@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-colors bg-gray-50/50"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-colors bg-gray-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-400/90 to-indigo-500/90 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-500/90 hover:to-indigo-600/90 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                New hospital?{" "}
                <Link
                  to="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <ShieldCheck className="inline w-4 h-4 mr-1" />
                Secure hospital authentication powered by AlertX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { PawPrint, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar({ currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Pet<span className="text-indigo-600 group-hover:text-indigo-500 transition-colors">Verse</span>
              </h1>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/pets" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                Browse Pets
              </Link>
              {currentUser && (currentUser.roles.includes("ROLE_SELLER") || currentUser.roles.includes("ROLE_ADMIN")) && (
                <Link to="/pets/create" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  List a Pet
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-indigo-600 bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <UserIcon className="h-4 w-4" />
                  <span>{currentUser.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

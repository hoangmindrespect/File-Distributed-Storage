import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "/app_logo.png";
import toast from "react-hot-toast";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setIsAdmin(false);
    toast.success("Logged out successfully!", {
        id: "logout-toast",
        duration: 2000,
    });
    navigate("/login");
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Logo */}
      <Link to="/my-drive" className="flex items-center space-x-2 ml-16">
        <img src={logo} className="h-8 w-8" alt="Logo" />
        <span className="text-gray-700 font-semibold text-xl">DFS</span>
      </Link>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mx-8">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search in Drive"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 pl-10 pr-12 border rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={() => navigate(`/search?q=${searchQuery}`)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-300 hover:bg-gray-400"
        >
          <FaSearch className="text-white" />
        </button>
      </div>

      {/* user profile */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            {/* <Link to="/login" className="text-white hover:text-gray-300">
              <button className="text-white font-semibold py-2 px-6 bg-[#F7452F] rounded-md hover:bg-[#ea4531] hover:text-gray-200">
                Login
              </button>
            </Link>
            <Link to="/register" className="text-white hover:text-gray-300">
              <button className="text-white font-semibold py-2 px-6 bg-[#213a54] rounded-md hover:bg-[#37587a] hover:text-gray-200">
                Register
              </button>
            </Link> */}
          </>
        ) : (
          <div
            onMouseEnter={() => {
              setIsUserMenuOpen(true);
            }}
            onMouseLeave={() => {
              setIsUserMenuOpen(false);
            }}
            className="relative"
          >
            <button
              type="button"
              className="flex text-sm rounded-full md:me-0 mb-1  focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              id="user-menu-button"
            >
              <span className="sr-only">Open user menu</span>
              <img
                className="w-8 h-8 rounded-full"
                src="https://cdn-icons-png.flaticon.com/512/6858/6858504.png"
                alt="user photo"
              />
            </button>
            {/* Dropdown menu */}
            {isUserMenuOpen && (
              <div
                className="z-50 my-4 absolute top-5 right-0 text-base list-none bg-white divide-y divide-gray-100 border rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                id="user-dropdown"
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-gray-900 dark:text-white">
                    Khang Nguyen
                  </span>
                  <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                    khangnguyen@gmail.com
                  </span>
                </div>
                <ul className="py-2" aria-labelledby="user-menu-button">
                  {isAdmin ? (
                    <li>
                      <Link
                        to={"/admin/managecustomer"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                  ) : (
                    ""
                  )}
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

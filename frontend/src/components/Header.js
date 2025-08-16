import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-purple-600 to-orange-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-white">
          <span className="text-orange-300">Life</span>Sync
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-white hover:bg-orange-500 hover:text-white'
              }`
            }
          >
            Login/Signup
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-white hover:bg-orange-500 hover:text-white'
              }`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-purple-700">
          <ul className="space-y-2 py-4 px-4">
            
            <li>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg font-medium ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-white hover:bg-orange-500 hover:text-white'
                  }`
                }
              >
                Login/Signup
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg font-medium ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-white hover:bg-orange-500 hover:text-white'
                  }`
                }
              >
                About
              </NavLink>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;

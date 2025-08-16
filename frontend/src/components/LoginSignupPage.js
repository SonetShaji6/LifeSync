import React, { useState } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion from framer-motion

const LoginSignupPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Clear previous messages
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/signup'; // Updated routes
            const data = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await axios.post(endpoint, data);

            // Store token and user data
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email
            }));

            setMessage('Success!');
            navigate('/home');
        } catch (error) {
            console.error("API Error:", error); // Log the full error for debugging

            if (error.response) {
                setMessage(error.response.data.message || 'Server Error');
            } else if (error.request) {
                setMessage('No response from server.');
            } else {
                setMessage('Error setting up the request.');
            }
        } finally {
        }
    };
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        staggerChildren: 0.2, // Stagger animation for child elements
      },
    },
  };

  const formVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, yoyo: Infinity }, // Add a slight bounce effect
    },
  };

  const switchVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-orange-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-row justify-between items-baseline flex-nowrap">
          <motion.h2
            className="text-2xl font-bold text-center text-purple-700 mb-4"
            variants={formVariants}
          >
            {isLogin ? 'Login' : 'Signup'}
          </motion.h2>
          <motion.button
            className="py-2 px-4 bg-gradient-to-r from-purple-500 to-orange-400 rounded-lg text-lg font-semibold shadow hover:opacity-90"
            onClick={() => navigate('/about')}
            variants={buttonVariants}
            whileHover="hover"
          >
            About
          </motion.button>
        </div>
        {message && (
          <motion.div
            className="text-center text-red-500 mb-4"
            variants={formVariants}
          >
            {message}
          </motion.div>
        )}
        <motion.form
          className="space-y-6"
          onSubmit={handleSubmit}
          variants={formVariants}
        >
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Name
              </label>
              <motion.input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                variants={formVariants}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <motion.input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your email"
              variants={formVariants}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <motion.input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your password"
              variants={formVariants}
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-2 text-white bg-gradient-to-r from-purple-600 to-orange-400 hover:opacity-90 shadow-lg rounded-lg"
            variants={buttonVariants}
            whileHover="hover"
          >
            {isLogin ? 'Login' : 'Signup'}
          </motion.button>
        </motion.form>
        <motion.p
          className="text-center mt-4"
          variants={formVariants}
        >
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <motion.span
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 font-semibold cursor-pointer hover:underline"
            variants={switchVariants}
            whileHover="hover"
          >
            {isLogin ? 'Signup' : 'Login'}
          </motion.span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoginSignupPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { FaUser, FaUsers, FaTasks, FaCog, FaSignOutAlt, FaCloud , FaClipboardList, FaPlusCircle,FaBriefcaseMedical} from 'react-icons/fa'; // Import icons from react-icons

const HomePage = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      alert('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      alert('Error logging out. Please try again.');
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
      },
    },
  };

  const textVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    hover: {
      scale: 1.1,
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-purple-600 to-orange-400 flex flex-col items-center justify-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl p-8  text-center h-[90vh] w-[90%]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold text-purple-700 mb-4"
          variants={titleVariants}
        >
          Welcome, {user?.name || 'User'}!
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-6"
          variants={textVariants}
        >
          We're glad to see you! Explore your dashboard and stay productive.
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <FaUser size={48} className="text-purple-600" />
            <span className="text-gray-700 mt-2">Profile</span>
          </motion.div>

          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/tasks')}
          >
            <FaTasks size={48} className="text-purple-600" />
            <span className="text-gray-700 mt-2">My Tasks</span>
          </motion.div>
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/plan-list')} // Replace '/plan-form' with your actual route
          >
            <FaClipboardList size={48} className="text-purple-600" /> {/* Replace with a suitable icon */}
            <span className="text-gray-700 mt-2">Create Plan</span>
          </motion.div>

          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/manage-family')}
          >
            <FaUsers size={48} className="text-purple-600" />
            <span className="text-gray-700 mt-2">Manage Family</span>
          </motion.div>

          {/* New Shared Storage Icon */}
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/shared-storage')} // Replace '/shared-storage' with your actual route
          >
            <FaCloud size={48} className="text-purple-600" /> 
            <span className="text-gray-700 mt-2">Shared Storage</span>
          </motion.div>

          {/* Add the Medical Vault icon */}
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/vault')} // Update with your vault route
          >
            <FaBriefcaseMedical size={48} className="text-purple-600" /> {/* Replace with your chosen icon */}
            <span className="text-gray-700 mt-2">Medical Vault</span>
          </motion.div>
          
          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <FaCog size={48} className="text-purple-600" />
            <span className="text-gray-700 mt-2">Settings</span>
          </motion.div>

          <motion.div
            variants={iconVariants}
            whileHover="hover"
            className="flex flex-col items-center cursor-pointer"
            onClick={handleLogout}
          >
            <FaSignOutAlt size={48} className="text-red-500" />
            <span className="text-gray-700 mt-2">Logout</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
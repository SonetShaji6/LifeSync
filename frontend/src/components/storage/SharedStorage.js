import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaUsers, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FamilyStorage from './FamilyStorage';
import PrivateStorage from './PrivateStorage';

const SharedStorage = ({ user }) => {
  const navigate = useNavigate();
  const [selectedStorage, setSelectedStorage] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3, yoyo: Infinity },
    },
  };

  const handleStorageSelect = (storageType) => {
    setSelectedStorage(storageType);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-purple-600 to-orange-400 flex flex-col items-center justify-center text-white p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl text-center relative"
        variants={containerVariants}
      >
        <motion.button
          className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
          onClick={() => navigate('/home')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaHome />
        </motion.button>

        {selectedStorage === null && (
          <div>
            <h2 className="text-3xl font-bold text-purple-700 mb-6">
              Select Storage Type
            </h2>
            <div className="flex space-x-4 justify-center">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg flex items-center"
                onClick={() => handleStorageSelect('family')}
              >
                <FaUsers className="mr-2" size={20} />
                Family Storage
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg flex items-center"
                onClick={() => handleStorageSelect('private')}
              >
                <FaLock className="mr-2" size={20} />
                Private Storage
              </motion.button>
            </div>
          </div>
        )}

        {selectedStorage === 'family' && <FamilyStorage user={user} />}
        {selectedStorage === 'private' && <PrivateStorage user={user} />}
      </motion.div>
    </motion.div>
  );
};

export default SharedStorage;
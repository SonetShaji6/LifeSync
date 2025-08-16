import React from 'react';
import axios from '../api/axiosConfig';

const Logout = () => {
  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default Logout;

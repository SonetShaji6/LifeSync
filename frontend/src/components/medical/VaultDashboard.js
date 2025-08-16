import React from "react";
import MedicalRecordList from "./MedicalRecordList";
import MedicationList from "./MedicationList";
import { motion } from "framer-motion";
import { FaStethoscope, FaCapsules,  FaHome, } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


function VaultDashboard({ user }) {
  const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  const navigate = useNavigate();

  const buttonVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 5, 0],
    },
    tap: {
      scale: 0.9,
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-8"
      variants={dashboardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
         <motion.button
            onClick={() => navigate("/home")}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaHome className="mr-2" size={20} />
            Home
          </motion.button>
        <h1 className="text-4xl font-bold mb-8 flex items-center">
          <FaStethoscope className="mr-3" size={40} />
          Welcome to Your Medical Vault, {user.name}!
        </h1>
      </div>
        <motion.div variants={sectionVariants}>
          <MedicalRecordList user={user} />
        </motion.div>

        <motion.div className="mt-10" variants={sectionVariants}>
          <MedicationList user={user} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default VaultDashboard;
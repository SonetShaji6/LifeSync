import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import MedicalRecordForm from "./MedicalRecordForm";
import { FaPlusCircle, FaEdit, FaTrash, FaShare, FaFileDownload, FaFilePdf, FaFileImage, FaFileAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function MedicalRecordList({ user }) {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`/medical-records`, {
          params: { userId: user._id },
        });
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching medical records:", error);
      }
    };

    fetchRecords();
  }, [user]);

  const handleRecordCreated = (newRecord) => {
    setRecords([...records, newRecord]);
    setShowForm(false); // Optionally close the form after creating a record
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFileDownload = async (recordId) => {
    try {
      const response = await axios.get(`/medical-records/${recordId}/download`);
      console.log('File downloaded:', response.data.contentType);
      // Create a URL for the blob
      const fileURL =  `${response.data.filePath}`;
  
      // Open the file in a new tab/window
      window.open(fileURL, '_blank'); 
  
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file.');
    }
  };
  

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger the animation of list items
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
    },
    tap: {
      scale: 0.95,
    },
  };

  const getFileIcon = (record) => {
    if (!record.file || !record.file.contentType) {
      return <FaFileAlt size={18} />; // Default icon
    }

    switch (record.file.contentType) {
      case 'application/pdf':
        return <FaFilePdf size={18} className="text-red-500" />;
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <FaFileImage size={18} className="text-blue-500" />;
      default:
        return <FaFileAlt size={18} />;
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Medical Records</h2>
        <motion.button
          onClick={toggleForm}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaPlusCircle className="mr-2" size={20} />
          Add Record
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="medicalRecordForm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MedicalRecordForm
              user={user}
              onRecordCreated={handleRecordCreated}
              handleCloseForm={handleCloseForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.ul
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {records.map((record) => (
          <motion.li
            key={record._id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between text-gray-800"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleFileDownload(record._id)}
          >
            <div>
              <h3 className="text-lg font-semibold">{record.title}</h3>
              <p className="text-sm text-gray-600">{record.recordType}</p>
              <p className="text-sm">
                {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                className="text-yellow-500 hover:text-yellow-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaEdit size={18} />
              </motion.button>
              <motion.button
                className="text-red-500 hover:text-red-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaTrash size={18} />
              </motion.button>
              <motion.button
                className="text-blue-500 hover:text-blue-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaShare size={18} />
              </motion.button>
              {/* Add download icon */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the li click event
                  handleFileDownload(record._id);
                }}
                className="text-blue-500 hover:text-blue-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {record.file ? getFileIcon(record) : <FaFileAlt size={18} />}
              </motion.button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default MedicalRecordList;
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import MedicationForm from "./MedicationForm";
import { FaPlusCircle, FaEdit, FaTrash, FaShare } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function MedicationList({ user }) {
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMedicationData, setEditMedicationData] = useState(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await axios.get(`/medications`, {
          params: { userId: user._id },
        });
        setMedications(response.data);
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };

    fetchMedications();
  }, [user]);

  const handleMedicationCreated = (newMedication) => {
    setMedications([...medications, newMedication]);
    setShowForm(false);
    setEditMedicationData(null);
  };

  const handleMedicationUpdated = (updatedMedication) => {
    setMedications(
      medications.map((med) =>
        med._id === updatedMedication._id ? updatedMedication : med
      )
    );
    setShowForm(false);
    setEditMedicationData(null);
  };

  const handleMedicationDeleted = (medicationId) => {
    setMedications(medications.filter((med) => med._id !== medicationId));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditMedicationData(null);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleEdit = (medication) => {
    setShowForm(true);
    setEditMedicationData(medication);
    
  };

  const handleDelete = async (medicationId) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        await axios.delete(`/medications/${medicationId}`);
        handleMedicationDeleted(medicationId);
        toast.success("Medication deleted successfully.");
      } catch (error) {
        console.error("Error deleting medication:", error);
        toast.error("Failed to delete medication.");
      }
    }
  };

  const handleShare = (medicationId) => {
    // Implement share functionality
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Medications</h2>
        <motion.button
          onClick={toggleForm}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <FaPlusCircle className="mr-2" size={20} />
          Add Medication
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="medicationForm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MedicationForm
              user={user}
              onMedicationCreated={handleMedicationCreated}
              onMedicationUpdated={handleMedicationUpdated}
              handleCloseForm={handleCloseForm}
              editMedicationData={editMedicationData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.ul
        className="space-y-4 text-gray-700"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {medications.map((medication) => (
          <motion.li
            key={medication._id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div>
              <h3 className="text-lg font-semibold">{medication.name}</h3>
              <p className="text-sm text-gray-600">{medication.dosage}</p>
              <p className="text-sm">{medication.frequency}</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => handleEdit(medication)}
                className="text-yellow-500 hover:text-yellow-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaEdit size={18} />
              </motion.button>
              <motion.button
                onClick={() => handleDelete(medication._id)}
                className="text-red-500 hover:text-red-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaTrash size={18} />
              </motion.button>
              <motion.button
                onClick={() => handleShare(medication._id)}
                className="text-blue-500 hover:text-blue-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaShare size={18} />
              </motion.button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default MedicationList;
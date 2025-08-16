import React, { useState , useEffect} from "react";
import axios from "../../api/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSave, FaSpinner } from 'react-icons/fa';

const MedicationForm = ({
  user,
  onMedicationCreated,
  onMedicationUpdated,
  handleCloseForm,
  editMedicationData,
}) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  
  useEffect(() => {
    if (editMedicationData) {
      setId(editMedicationData._id);
      setName(editMedicationData.name);
      setDosage(editMedicationData.dosage);
      setFrequency(editMedicationData.frequency);
      setStartDate(
        editMedicationData.startDate
          ? new Date(editMedicationData.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        editMedicationData.endDate
          ? new Date(editMedicationData.endDate).toISOString().split("T")[0]
          : ""
      );
      setDoctor(editMedicationData.doctor);
      setNotes(editMedicationData.notes);
    } else {
        setId("");
        setName("");
        setDosage("");
        setFrequency("");
        setStartDate("");
        setEndDate("");
        setDoctor("");
        setNotes("");
    }
  }, [editMedicationData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editMedicationData) {
        // Update existing medication
        const response = await axios.put(`/medications/${id}`, {
          name,
          dosage,
          frequency,
          startDate,
          endDate,
          doctor,
          notes,
        });
        onMedicationUpdated(response.data);
        toast.success("Medication updated successfully!");
      } else {
        // Create new medication
        const response = await axios.post("/medications", {
          user: user._id,
          name,
          dosage,
          frequency,
          startDate,
          endDate,
          doctor,
          notes,
        });
        onMedicationCreated(response.data);
        toast.success("Medication added successfully!");
      }
      handleCloseForm(); // Close the form after submit
    } catch (error) {
      console.error("Error submitting medication:", error);
      toast.error(
        "Failed to " +
          (editMedicationData ? "update" : "add") +
          " medication."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="bg-gray-100 p-6 rounded-lg shadow-lg text-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        {editMedicationData ? "Edit Medication" : "Add Medication"}
      </h2>
      <motion.form onSubmit={handleSubmit} variants={formVariants}>
      <div className="mb-4">
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Medication Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="dosage"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Dosage:
          </label>
          <input
            type="text"
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="frequency"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Frequency:
          </label>
          <input
            type="text"
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            lassName="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="endDate"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="doctor"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Doctor:
          </label>
          <input
            type="text"
            id="doctor"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="notes"
            className="block mb-2 text-sm font-medium text-gray-600"
          >
            Notes:
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        {/* ... */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" size={18} />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2" size={18} />
              {editMedicationData ? "Update" : "Save"} Medication
            </>
          )}
        </button>
      </motion.form>
    </motion.div>
  );
};

export default MedicationForm;
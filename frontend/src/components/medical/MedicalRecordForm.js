import React, { useState } from "react";
import axios from "../../api/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSave, FaSpinner } from "react-icons/fa"; // Import icons

const MedicalRecordForm = ({ user, onRecordCreated, handleCloseForm }) => {
  const [recordType, setRecordType] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [doctor, setDoctor] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("user", user._id);
      formData.append("recordType", recordType);
      formData.append("date", date);
      formData.append("title", title);
      formData.append("institution", institution);
      formData.append("doctor", doctor);
      formData.append("details", details);
      if (file) {
        formData.append("file", file);
      }

      const response = await axios.post("/medical-records", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onRecordCreated(response.data);
      toast.success("Medical record created successfully!");
      setRecordType("");
      setDate("");
      setTitle("");
      setInstitution("");
      setDoctor("");
      setDetails("");
      setFile(null);
    } catch (error) {
      console.error("Error creating medical record:", error);
      toast.error("Failed to create medical record.");
    } finally {
      setIsLoading(false);
      handleCloseForm()
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

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
        Add Medical Record
      </h2>
      <motion.form onSubmit={handleSubmit} variants={formVariants}>
        <div className="mb-4">
          <label htmlFor="recordType" className="block mb-2 text-sm font-medium text-gray-600">
            Record Type:
          </label>
          <select
            id="recordType"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="lab result">Lab Result</option>
            <option value="imaging report">Imaging Report</option>
            <option value="clinical note">Clinical Note</option>
            <option value="prescription">Prescription</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-600">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-600">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="institution" className="block mb-2 text-sm font-medium text-gray-600">
            Institution:
          </label>
          <input
            type="text"
            id="institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="doctor" className="block mb-2 text-sm font-medium text-gray-600">Doctor:</label>
          <input
            type="text"
            id="doctor"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="details" className="block mb-2 text-sm font-medium text-gray-600">
            Details:
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="file" className="block mb-2 text-sm font-medium text-gray-600">File:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
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
              Save Record
            </>
          )}
        </button>
      </motion.form>
    </motion.div>
  );
};

export default MedicalRecordForm;
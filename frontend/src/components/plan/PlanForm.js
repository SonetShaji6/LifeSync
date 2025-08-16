import React, { useState } from "react";
import axios from "../../api/axiosConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSpinner, FaSave } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PlanForm = ({ user, onPlanCreated }) => {
  const [planType, setPlanType] = useState("study");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPlan(null);
    const userId = user._id;

    try {
      const response = await axios.post("/generate-plan", {
        planType,
        startDate,
        endDate,
        description,
        userId,
      });

      onPlanCreated(response.data);
      setGeneratedPlan(response.data.plan);

      toast.success("Plan generated and saved successfully!");
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error(
        "Error generating plan: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const formVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-gray-800 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create a New Plan
      </h2>
      <motion.form  onSubmit={handleSubmit} variants={formVariants}>
        <div className="mb-4 ">
          <label
            htmlFor="planType"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Plan Type:
          </label>
          <select
            id="planType"
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="study">Study</option>
            <option value="work">Work</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="endDate"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" size={18} />
              Generating...
            </>
          ) : (
            <>
              <FaSave className="mr-2" size={18} />
              Generate Plan
            </>
          )}
        </button>
      </motion.form>

      {generatedPlan && (
        <motion.div
          className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Generated Plan:
          </h3>
          <ReactMarkdown
            className="markdown-content"
            remarkPlugins={[remarkGfm]}
          >
            {generatedPlan}
          </ReactMarkdown>
        </motion.div>
      )}
      <br></br>
    </motion.div>
  );
};

export default PlanForm;
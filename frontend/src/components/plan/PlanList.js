import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosConfig";
import PlanForm from "./PlanForm";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlusCircle,
  FaClipboardList,
  FaCalendarDay,
  FaCalendarWeek,
  FaEdit,
  FaHome,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PlanList = ({ user }) => {
  const [plans, setPlans] = useState([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0); // Index of the currently displayed plan
  const planRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      // Only fetch if user and user._id are defined
      if (user && user._id) {
        const userId = user._id;
        try {
          const response = await axios.get(`/plans?userId=${userId}`);
          setPlans(response.data.plans);
          if (response.data.plans.length > 0) {
            setCurrentPlanIndex(0); // Show the first plan by default
          }
        } catch (error) {
          console.error("Error fetching plans:", error);
        }
      }
    };

    fetchPlans();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (plans.length === 0) return;

      if (event.key === "ArrowUp") {
        setSelectedPlanIndex((prevIndex) =>
          prevIndex === null || prevIndex === 0
            ? plans.length - 1
            : prevIndex - 1
        );
      } else if (event.key === "ArrowDown") {
        setSelectedPlanIndex((prevIndex) =>
          prevIndex === null || prevIndex === plans.length - 1
            ? 0
            : prevIndex + 1
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [plans]);

  useEffect(() => {
    if (selectedPlanIndex !== null && planRefs.current[selectedPlanIndex]) {
      planRefs.current[selectedPlanIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedPlanIndex]);

  const handlePlanCreated = (response) => {
    if (response) {
      setPlans((prevPlans) => [...prevPlans, response]);
      setShowPlanForm(false);
      setCurrentPlanIndex(plans.length);
    } else {
      console.error("Invalid plan data received:", response);
      toast.error("Failed to add the new plan. Invalid data received.");
    }
  };

  const togglePlanForm = () => {
    setShowPlanForm(!showPlanForm);
  };
  const handlePrevious = () => {
    setCurrentPlanIndex((prevIndex) =>
      prevIndex === 0 ? plans.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentPlanIndex((prevIndex) =>
      prevIndex === plans.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      rotate: [0, -5, 5, -5, 5, 0],
    },
    tap: {
      scale: 0.9,
    },
  };

  const formatPlan = (planText) => {
    const lines = planText.split("\n");
    let formattedPlan = [];
    let dayIndex = 0;

    const headingRegex = /^(Day \d+)/i;
    const taskRegex = /^\s*-\s*(.*)/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (headingRegex.test(line)) {
        // Increment day index when encountering a new day heading
        dayIndex++;
        formattedPlan.push(
          <h4 key={`day-${dayIndex}`} className="font-bold mt-4 text-lg">
            {line}
          </h4>
        );
      } else if (taskRegex.test(line)) {
        // Format tasks with bullet points
        const task = line.match(taskRegex)[1];
        formattedPlan.push(
          <li key={`task-${i}`} className="list-item list-disc ml-6">
            {task}
          </li>
        );
      } else if (line.trim() !== "") {
        // Format other lines as paragraphs
        formattedPlan.push(
          <p key={`para-${i}`} className="mt-2">
            {line}
          </p>
        );
      }
    }

    return <div className="plan-content">{formattedPlan}</div>;
  };

  return (
    <motion.div
      className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 ">
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

          <h2 className="text-3xl font-bold flex items-center">
            <FaClipboardList className="mr-2" size={32} />
            Your Plans
          </h2>
          <motion.button
            onClick={togglePlanForm}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full flex items-center shadow-lg hover:shadow-xl transition-all"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaPlusCircle className="mr-2" size={24} />
            New Plan
          </motion.button>
        </div>

        <AnimatePresence>
          {showPlanForm && (
            <motion.div
              key="planForm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex justify-around"
            >
              <PlanForm user={user} onPlanCreated={handlePlanCreated} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Next/Previous buttons */}
        <div className="flex justify-center mb-4">
          <br></br>
          <motion.button
            onClick={handlePrevious}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={plans.length === 0}
          >
            <FaArrowLeft className="mr-2" size={16} />
            Previous
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={plans.length === 0}
          >
            Next
            <FaArrowRight className="ml-2" size={16} />
          </motion.button>
        </div>

        {/* Display Current Plan */}
        <AnimatePresence>
          {plans.length > 0 && plans[currentPlanIndex] && (
            <motion.div
              key={plans[currentPlanIndex]._id}
              className="bg-white rounded-lg shadow-xl p-6 text-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-purple-800">
                  {plans[currentPlanIndex].planType} Plan
                </h3>
                <FaEdit className="text-gray-500 hover:text-blue-600 cursor-pointer" />
              </div>
              <div className="flex items-center mb-2 text-sm">
                <FaCalendarDay className="mr-2 text-purple-600" />
                <span className="font-medium">Start:</span>{" "}
                {new Date(
                  plans[currentPlanIndex].startDate
                ).toLocaleDateString()}
              </div>
              <div className="flex items-center mb-4 text-sm">
                <FaCalendarWeek className="mr-2 text-purple-600" />
                <span className="font-medium">End:</span>{" "}
                {new Date(
                  plans[currentPlanIndex].endDate
                ).toLocaleDateString()}
              </div>
              <p className="text-gray-700 mb-4">
                {plans[currentPlanIndex].description}
              </p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-800">Generated Plan:</h4>
                {/* Use ReactMarkdown to render the generated plan */}
                <ReactMarkdown
                  className="markdown-content mt-2"
                  remarkPlugins={[remarkGfm]}
                >
                  {plans[currentPlanIndex].generatedPlan}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PlanList;
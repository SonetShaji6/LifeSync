// frontend/src/pages/MngFamily.js
import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaPlus,
  FaUserPlus,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MngFamily = ({ user }) => {
  const navigate = useNavigate();

  const [families, setFamilies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const familiesResponse = await axios.get("/families");
        setFamilies(familiesResponse.data);
      } catch (error) {
        console.error("Error fetching families:", error);
        toast.error("Error fetching data.");
      }
    };

    fetchUserData();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`/families/search?q=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching families:", error);
      toast.error("Error searching for families.");
    }
  };

  const handleCreateFamily = async () => {
    if (newFamilyName.trim() === "") {
      toast.error("Please enter a family name.");
      return;
    }

    setIsCreatingFamily(true);

    try {
      const response = await axios.post("/families", {
        name: newFamilyName,
      });
      setFamilies([...families, response.data]);
      setNewFamilyName("");
      toast.success("Family created successfully!");
    } catch (error) {
      console.error("Error creating family:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error creating family.");
      }
    } finally {
      setIsCreatingFamily(false);
    }
  };

  const handleJoinRequest = async (familyId) => {
    try {
      const response = await axios.post(`/families/${familyId}/join`);
      if (response.status === 200) {
        toast.success(response.data.message);
      } else {
        toast.error("Failed to send join request.");
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error sending join request.");
      }
    }
  };

  const handleFamilySelect = async (family) => {
    if (selectedFamily && selectedFamily._id === family._id) {
      // If the same family is clicked again, hide the details
      setSelectedFamily(null);
      return;
    }
  
    setSelectedFamily(family);
  
    try {
      const response = await axios.get(`/families/${family._id}/members`);


      // Fetch join requests if the user is the admin of this family
      if (family.admin === user?._id) {
        try {
          const joinRequestsResponse = await axios.get(`/families/${family._id}/joinRequests`);
          family.joinRequestsData = joinRequestsResponse.data;
          console.log("Join Requests:", joinRequestsResponse.data);
        } catch (error) {
          console.error("Error fetching join requests:", error);
          toast.error("Error fetching join requests.");
        }
      }
  
      setSelectedFamily((prevFamily) => ({
        ...prevFamily,
        membersData: response.data,
      }));
  
    } catch (error) {
      console.error("Error fetching family members:", error);
      toast.error("Error fetching family members.");
    }
  };
  const handleApproveJoinRequest = async (familyId, userId) => {
    try {
      await axios.patch(`/families/${familyId}/approve/${userId}`);

      setFamilies((prevFamilies) =>
        prevFamilies.map((family) =>
          family._id === familyId
            ? {
                ...family,
                members: [...family.members, userId],
                joinRequests: family.joinRequests.filter(
                  (id) => id !== userId
                ),
              }
            : family
        )
      );

      if (selectedFamily && selectedFamily._id === familyId) {
        // Update membersData and joinRequestsData
        const updatedMembersData = [
          ...selectedFamily.membersData,
          selectedFamily.joinRequestsData.find(
            (user) => user._id === userId
          ),
        ];
        const updatedJoinRequestsData = selectedFamily.joinRequestsData.filter(
          (user) => user._id !== userId
        );

        setSelectedFamily((prevFamily) => ({
          ...prevFamily,
          members: [...prevFamily.members, userId],
          joinRequests: prevFamily.joinRequests.filter((id) => id !== userId),
          membersData: updatedMembersData,
          joinRequestsData: updatedJoinRequestsData,
        }));
      }

      toast.success("Join request approved.");
    } catch (error) {
      console.error("Error approving join request:", error);
      toast.error("Error approving join request.");
    }
  };

  const handleRemoveMember = async (familyId, userId) => {
    try {
      await axios.delete(`/families/${familyId}/members/${userId}`);

      setFamilies((prevFamilies) =>
        prevFamilies.map((family) =>
          family._id === familyId
            ? {
                ...family,
                members: family.members.filter((id) => id !== userId),
              }
            : family
        )
      );

      if (selectedFamily && selectedFamily._id === familyId) {
        setSelectedFamily((prevFamily) => ({
          ...prevFamily,
          members: prevFamily.members.filter((id) => id !== userId),
          membersData: prevFamily.membersData.filter(
            (member) => member._id !== userId
          ),
        }));
      }

      toast.success("Member removed.");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Error removing member.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: { opacity: 0, x: 20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-purple-600 to-orange-400 flex flex-col items-center justify-center text-white p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl text-center relative overflow-hidden"
        variants={containerVariants}
      >
        <motion.button
          className="absolute top-4 left-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
          onClick={() => navigate("/home")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaHome />
        </motion.button>

        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Manage Family
        </h1>

        <motion.div className="mb-6" variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-center">
            <FaPlus className="mr-2" /> Create a Family
          </h2>
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="px-3 py-2 border rounded-lg mr-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              placeholder="Enter family name"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
            <button
              className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ${
                isCreatingFamily ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCreateFamily}
              disabled={isCreatingFamily}
            >
              {isCreatingFamily ? "Creating..." : "Create"}
            </button>
          </div>
        </motion.div>

        <motion.div className="mb-6" variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-700 mb-2 flex items-center justify-center">
            <FaSearch className="mr-2" /> Find a Family
          </h2>
          <div className="flex items-center justify-center">
            <input
              type="text"
              className="px-3 py-2 border rounded-lg mr-2 w-2/3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              placeholder="Search for a family"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
          <AnimatePresence>
            {searchResults?.length > 0 && (
              <motion.ul
                className="mt-4"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: { opacity: 0, height: 0 },
                  visible: { opacity: 1, height: "auto" },
                }}
                transition={{ duration: 0.3 }}
              >
                {searchResults.map((family) => (
                  <motion.li
                    key={family._id}
                    className="flex justify-between items-center mb-2 p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                    variants={itemVariants}
                  >
                    <span className="text-gray-700">{family.name}</span>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg text-sm transition duration-300 flex items-center"
                      onClick={() => handleJoinRequest(family._id)}
                    >
                      <FaUserPlus className="mr-1" /> Request to Join
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your Families
          </h2>
          {families.length > 0 ? (
            <ul className="mt-4">
              {families.map((family) => (
                <motion.li
                  key={family._id}
                  className="flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-300"
                  onClick={() => handleFamilySelect(family)}
                  variants={itemVariants}
                >
                  <span className="text-gray-700">{family.name}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">
              You are not a member of any families yet.
            </p>
          )}
        </motion.div>

        <AnimatePresence>
          {selectedFamily && (
            <motion.div
              className="mt-6 border-t border-gray-200 pt-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Family Details: {selectedFamily.name}
              </h3>
              <p className="mb-2">
                Admin:{" "}
                {selectedFamily.admin.name} ({selectedFamily.admin.email})
              </p>

              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Members:
                </h4>
                <ul>
                  {selectedFamily.membersData ? (
                    selectedFamily.membersData.map((member) => (
                      <li
                        key={member._id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700">
                          {member.name} ({member.email})
                        </span>
                        {selectedFamily.admin === member._id ? (
                          <span className="text-xs text-gray-500">
                            (Admin)
                          </span>
                        ) : ( selectedFamily.admin === user._id ? (
                          <div>
                            <button
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-lg text-sm transition duration-300 mr-2"
                              onClick={() =>
                                handleRemoveMember(
                                  selectedFamily._id,
                                  member._id
                                )
                              }
                            >
                              <FaTimes className="mr-1" /> Remove
                            </button>
                          </div> ) : (null)
                            
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-700">Loading members...</li>
                  )}
                </ul>
              </div>

              {/* ... your existing code ... */}

              {/* Join Requests (if current user is admin) */}
              {user &&
                selectedFamily.admin === user._id &&
                selectedFamily.joinRequestsData &&
                selectedFamily.joinRequestsData.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      Join Requests:
                    </h4>
                    <ul>
                      {selectedFamily.joinRequestsData.map((user) => (
                        <li
                          key={user._id}
                          className="flex items-center justify-between pb-3"
                        >
                          <span className="text-gray-700">
                            {user.name} ({user.email})
                          </span>
                          <div>
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg text-sm transition duration-300 mr-2"
                              onClick={() =>
                                handleApproveJoinRequest(
                                  selectedFamily._id,
                                  user._id
                                )
                              }
                            >
                              <FaCheck className="mr-1 " /> Approve
                            </button>
                            {/* Add a button to reject the request if needed */}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default MngFamily;
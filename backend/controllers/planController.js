const axios = require("axios");
const Plan = require("../models/Plan"); // Import your Plan model

exports.generatePlan = async (req, res) => {
  try {
    const { planType, startDate, endDate, description,userId  } = req.body;
    console.log("userId", userId);
    // Construct the prompt for the Gemini API
    const prompt = `
      Create a detailed ${planType} plan for the following:

      Start Date: ${startDate}
      End Date: ${endDate}
      Description: ${description}

      Please provide a step-by-step plan with specific tasks, deadlines, and milestones.
      Formatting Instructions:
        1. Use Markdown for formatting.
        2. Use headings (H2, H3, etc.) to organize the plan into sections (e.g., "Weekly Schedule", "Week 1", "Week 2", etc.).
        3. Use bullet points for daily tasks.
        4. Use numbered lists for steps within a task.
        5. Highlight important deadlines using bold text.
        6. If applicable, include tables to organize information clearly.
        7. Provide a summary of weekly milestones at the end of each week's section.
    `;

    // Call the Gemini API (replace with your actual API key)
    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAIm6JyAxsfxOV4C6--BmRezj9K71zsr0s",
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Extract the generated text
    const generatedPlan = geminiResponse.data.candidates[0].content.parts[0].text;

    // Create a new Plan document
    const newPlan = new Plan({
      user: userId,
      planType,
      startDate,
      endDate,
      description,
      generatedPlan: generatedPlan, // Assuming you want to store the generated text
      geminiResponse: geminiResponse.data, // Store the raw response for debugging or future use
    });


    // Save the plan to the database
    await newPlan.save();

    // Send the generated plan text to the frontend
    res.status(200).json({ 
      plan: generatedPlan,
      message: "Plan generated and saved successfully",
      _id: newPlan._id, // Assuming _id is the unique identifier
      user: newPlan.user,
      planType: newPlan.planType,
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      description: newPlan.description,
      createdAt: newPlan.createdAt
    });
  } catch (error) {
    console.error("Error generating plan:", error);

    // Handle errors from the Gemini API
    if (error.response && error.response.data) {
      res.status(500).json({
        message: "Error from Gemini API",
        error: error.response.data,
      });
    } else {
      res.status(500).json({ message: "Error generating plan" });
    }
  }
};

// In planController.js
exports.listPlans = async (req, res) => {
    try {
      // Get userId from query parameters
      const userId = req.query.userId;
  
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
  
      // Find all plans for the user
      const plans = await Plan.find({ user: userId }).sort({ createdAt: -1 });
  
      res.status(200).json({ plans });
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Error fetching plans" });
    }
  };
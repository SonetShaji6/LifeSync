require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const sessionConfig = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const familyRoutes = require('./routes/familyRoutes');
const errorHandler = require('./utils/errorHandler');
const cors = require('cors');
const pinRoutes = require('./routes/pinRoutes');
const storageRoutes = require('./routes/storageRoutes');
const planRoutes = require('./routes/planRoutes');
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const path = require("path");



const app = express();

// Middleware
app.use(express.json());
app.use(sessionConfig);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Allow cookies
  }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/', planRoutes);
app.use('/', pinRoutes);
app.use('/', storageRoutes); 
app.use("/", medicalRecordRoutes);
app.use("/", medicationRoutes);
// Error Handling
app.use(errorHandler);

// Connect to DB and Start Server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

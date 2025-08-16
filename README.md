# LifeSync

LifeSync is a **MERN stack personal management application** designed to organize and simplify daily life. It provides secure storage, family collaboration, medical record management, task and study planning, reminders, and more — all in one place.

---

## 🚀 Features

* **Authentication**

  * JWT-based login and signup system.
  * Session management with secure middleware.

* **Shared Storage**

  * **Private Storage**: Protected by a 6-digit PIN.
  * **Family Storage**: Users can create/join families and share files.
  * Family creator can manage join requests.

* **Family Management**

  * Create a family group.
  * Search and request to join families.
  * Accept/reject join requests.
  * Family chat integration.

* **Plans & Tasks**

  * Create and view work/study plans.
  * Auto-generated plans based on inputs.
  * Categorize tasks (physical, mental, learning).
  * Built-in timers for productivity.

* **Reminders**

  * Create reminders for important dates and events.

* **Personalized Diary**

  * Generate diary entries based on daily inputs (mood, places, etc.).
  * Calendar view for past entries.

* **Medical Vault**

  * Store and manage medical records securely.
  * Medication management and reminders.

---

## 🛠️ Tech Stack

### Backend

* Node.js + Express.js
* MongoDB + Mongoose
* JWT for authentication
* Multer for file uploads

### Frontend

* React.js
* Tailwind CSS
* Axios (API requests)

---

## 📂 Project Structure

```
LifeSunc/
├── backend/
│   ├── server.js          # Entry point
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoints
│   ├── models/            # Mongoose schemas
│   ├── config/            # DB & session configs
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Validators, tokens, error handlers
│   ├── storage/           # File storage system
│   └── uploads/           # User uploads
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Root component
│   │   ├── index.js       # React entry point
│   │   └── styles/        # Tailwind + CSS
│   └── package.json       # Frontend dependencies
```

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js (v16+ recommended)
* MongoDB (local or cloud via MongoDB Atlas)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/LifeSunc.git
   cd LifeSunc
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   cp .env.example .env   # configure DB_URI, JWT_SECRET, etc.
   npm start
   ```

3. **Frontend Setup:**

   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

---

## 📌 Usage

* Register or log in as a user.
* Explore private/family storage.
* Create study/work plans.
* Add reminders and manage tasks.
* Upload/view medical records.
* Use family features (create/join/search families).

---

## 📸 Screenshots


---

## 🤝 Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

---


---

## 👩‍💻 Author

**Sonet Shaji**

# 🌍 Jeevan Link – Disaster Relief & Emergency Assistance Platform

**Jeevan Link** is a web-based disaster relief and emergency assistance coordination platform designed to connect affected individuals with NGOs and relief organizations.

The platform helps organize emergency requests, prioritize assistance using machine learning, manage relief camps, and track available resources through a centralized system.

## ✨ Key Features

- 🚨 **Emergency Assistance Requests** – Users can submit requests for emergency help.
- 🤖 **Machine Learning Predictions** – Predicts urgency levels, assistance requirements, and estimated time of arrival (ETA).
- 🏢 **NGO Dashboard** – Allows NGOs to view and manage emergency requests.
- 🏕️ **Relief Camp Management** – NGOs can register and manage relief camps.
- 📦 **Resource Management** – NGOs can add and maintain records of available food, water, medical supplies, clothing, and other resources.
- 👥 **Role-Based Access** – Different functionalities are available according to user roles.
- 🔔 **Notifications and Announcements** – Supports communication and updates within the platform.

## 🛠️ Technology Stack

### Frontend

- React.js – User interface development
- Vite – Frontend development and build tool
- Tailwind CSS – Styling and responsive design
- Redux Toolkit – State management
- Axios – API communication

### Backend

- Node.js – JavaScript runtime
- Express.js – Backend framework and REST API development
- Mongoose – MongoDB object modeling

### Database

- MongoDB – Stores user information, emergency requests, relief camps, and resource records.

### Machine Learning

- Python – Machine learning implementation
- FastAPI – Machine learning API service
- Scikit-learn – Machine learning algorithms
- Random Forest – Classification-based prediction

## 🏗️ System Architecture

The application consists of three main components:

1. **Frontend:** React communicates with the backend through API requests.
2. **Backend:** Node.js and Express handle application logic, authentication, and database operations.
3. **Machine Learning Service:** Python and FastAPI provide prediction services to the backend.

MongoDB is used to store and retrieve application data.

## 📁 Project Structure

```text
jeevan_link_project/
│
├── client/                 # React frontend
│
├── server/                 # Node.js and Express backend
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
│
├── ml/                     # Python machine learning service
│   ├── Data/
│   ├── Models/
│   ├── ml_api.py
│   └── requirements.txt
│
├── .github/
│   └── workflows/          # GitHub Actions workflows
│
└── README.md
```

## 🚀 Running the Project Locally

### Prerequisites

- Node.js and npm
- Python
- MongoDB
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Vaishnavi-agrawal1102/Jeevan_Link.git
cd jeevan_link_project
```

### 2. Start MongoDB

Make sure your MongoDB service is running locally.

### 3. Start the Machine Learning API

```bash
cd ml
```

Create and activate a Python virtual environment if required, then install dependencies:

```bash
pip install -r requirements.txt
```

Start the ML API:

```bash
python -m uvicorn ml_api:app --host 127.0.0.1 --port 8000
```

### 4. Start the Backend

Open a new terminal:

```bash
cd server
npm install
npm run dev
```

Configure the backend environment variables in `server/.env` using the provided environment example.

For a local MongoDB setup, the database URI is:

```text
mongodb://127.0.0.1:27017/jeevan_link
```

### 5. Start the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local development URL displayed by Vite, usually:

```text
http://localhost:5173/
```

**Note:** Keep the ML API, backend, and frontend running in their respective terminals.

## 🧠 Machine Learning Modules

Jeevan Link integrates three prediction services:

- **Urgency Prediction:** Classifies emergency requests into Low, Medium, High, and Critical levels.
- **Assistance Prediction:** Helps identify the type of assistance required.
- **ETA Prediction:** Provides an estimated time related to assistance delivery.

These predictions support emergency prioritization and relief coordination.

## 🔮 Future Scope

- Improved real-time emergency coordination.
- Enhanced resource allocation between relief camps.
- Integration with additional disaster monitoring services.
- Improved geographical visualization and location-based assistance.
- Deployment for wider public accessibility.

## 📌 Project Information

Jeevan Link is an academic project developed to demonstrate the integration of web technologies, database management, and machine learning in disaster relief coordination.

The platform aims to make emergency assistance and NGO coordination more organized and efficient.

---

**Project Name:** Jeevan Link  
**Category:** Disaster Management and Emergency Assistance  
**Architecture:** MERN Stack with Python-based Machine Learning Service

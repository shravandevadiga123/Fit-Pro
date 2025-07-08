# FitPro Manager

**FitPro Manager** is a full-stack web application designed to simplify fitness center operations. It provides tools to manage members, trainers, classes, attendance, and authentication — all from a clean and responsive dashboard. Built using the **MERN stack** with MySQL and secure authentication, it brings modern tech to gym management.

## Features

- Member and trainer management with full CRUD
- Class creation and attendance tracking
- Authentication with email verification and password reset
- Dashboard with modular navigation and user profile
- Clean UI built with React

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js  
- **Database:** MySQL (hosted on Aiven)  
- **Authentication:** JWT, Nodemailer  
- **Deployment:** Render (backend), Vercel (frontend)

## Live Demo

- 🔗 **Frontend:** [https://fit-pro-manager.vercel.app](https://fit-pro-manager.vercel.app)  
- 🔗 **Backend:** [https://fitpro-backend-tmuj.onrender.com](https://fitpro-backend-tmuj.onrender.com)  
- 📂 **GitHub Repo:** [https://github.com/shravandevadiga123/Fit-Pro](https://github.com/shravandevadiga123/Fit-Pro)

---

## Getting Started (Local Setup)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/shravandevadiga123/Fit-Pro.git
   cd Fit-Pro

2. **Navigate to the backend folder**
   ```bash
   cd backend

3. **Install backend dependencies**
   ```bash
   npm install

4. **Create a `.env` file**  
   In the `/backend` folder, add the following environment variables:

   ```env
   # JWT secret for authentication
   SECRET_KEY=your_secret_key_here

   # Aiven MySQL Database configuration
   DB_HOST=your_db_host_url
   DB_PORT=your_db_port
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name

   # CA Certificate (can be stored as a single string or path to .crt file)
   DB_CA=-----BEGIN CERTIFICATE-----
   YOUR_CA_CERT_CONTENT_HERE
   -----END CERTIFICATE-----

   # Email credentials for nodemailer
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password

   # Base URL for backend API
   BASE_URL=http://localhost:5006

5. **Start the backend**
   Ensure your Mysql service is running
   ```bash
   npm start

6. **Navigate to frontend folder**
   Open a new terminal window
   ```bash
   cd ../frontend

7. **Install frontend dependencies**
   ```bash
   npm install

8. **Create a `.env` file in the `/frontend` directory**  
    Add the following variables to connect your React app with the backend:

    ```env
    REACT_APP_API_URL=http://localhost:5006/api/auth
    REACT_APP_API_BASE=http://localhost:5006
    ```

    ⚠️ Environment variable names in React **must start with** `REACT_APP_` to be recognized at build time.

9. **Start the frontend React app**  
    ```bash
    npm start
    


   

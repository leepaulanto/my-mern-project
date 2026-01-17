# NeonVote - Secure Online Voting Platform 🗳️

A MERN Stack-based online voting platform built for the White Matrix Internship Machine Test. This application allows users to authenticate securely, view candidate profiles, and cast a single vote in a transparent election system.

## 👥 Team Members
* **Lee Paul Anto**
* **Raina Shaju**

---

## 🚀 Live Demo
* **Frontend (Vercel):** https://whitematrixvotingplatform.vercel.app/
* **Backend (Render):** https://my-mern-project-il15.onrender.com

---


## 🌟 Features

### ✅ Mandatory Features (Implemented)
* **Secure Authentication:** Support for Google Login, LinkedIn Login, and Local Email/Password.
* **One-Vote Policy:** Strict database enforcement ensures each authenticated user can vote only once.
* **Candidate Dashboard:** View candidate profiles with photos and direct LinkedIn links.
* **Voter Registry:** A transparent "Results" page listing all voters and their linked profiles.
* **Forgot Password:** Functionality to handle password resets.

### 🚀 Additional Features
* **Live Poll Stats:** Real-time progress bars and percentage calculation for candidates.
* **Smart Profile Enforcement:** Automatically prompts users to add a LinkedIn profile if missing before allowing them to vote.
* **Input Validation:** Ensures only valid LinkedIn URLs are accepted to maintain data integrity.
* **Responsive Dark Mode UI:** A modern, mobile-friendly interface with a neon aesthetic.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, React Router, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** Passport.js (Google/LinkedIn Strategies) & JWT

---

## ⚙️ Setup Instructions

### Prerequisites
* Node.js (v14 or higher)
* MongoDB URI (Local or Atlas)
* Google/LinkedIn OAuth Credentials

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd my-mern-project
### 2. Backend Setup (Root Folder)
The server handles API requests and database connections.
1.  Open your terminal in the **root** folder.
2.  Install dependencies:
```bash
 npm install
 ```
3.  Create a `.env` file in the **root** folder and add the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
COOKIE_KEY=any_random_secure_string_for_encryption
                                
# OAuth Credentials (Get these from Google/LinkedIn Developer Consoles)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
# Client URL (For redirects) - In Codespaces, this is your Frontend URL
# If running locally, use http://localhost:3000
CLIENT_URL=http://localhost:3000
---
### 3. Frontend Setup (Client Folder)
The React application lives in the `client` folder.
1.Navigate to the client folder:
```bash
cd client
```
2.  Install dependencies:
```bash
npm install
```
3.  Create a `.env` file in the **client** folder.
* *Crucial Step for Codespaces:* You must use the **Forwarded Address** for port 5000, not just `localhost`.
* Check the **”Ports”** tab in VS Code to find the address for Port 5000.
Add this line to your `.env` file:
```env
# Replace the URL below with your actual Codespace Backend URL (Port 5000)
REACT_APP_BACKEND_URL=[https://your-codespace-name-5000.app.github.dev](https://your-codespace-name-5000.app.github.dev)
```
### 4. Running the Application
**Option A: Run Separately (Recommended)**
Open two separate terminals:
* **Terminal 1 (Backend):**
```bash
npm start
```
*(Runs on Port 5000)*
* **Terminal 2 (Frontend):**
```bash
cd client
npm start
```
*(Runs on Port 3000)*
--- 
## 🧪 Deployment Info
This project is configured for deployment on **Render** (Backend) and **Vercel** (Frontend).
* **Backend Build Command:** `npm install`
* **Frontend Build Command:** `cd client && npm install && npm run build`
 * **Environment Variables:** Ensure all `.env` variables are added to your deployment dashboard settings.

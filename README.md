# AI-Assisted Blockchain-Based Certificate Management and Verification System

## Description
A full-stack web application for educational institutions to generate, manage, issue, and verify digital certificates securely using Blockchain and AI document analysis.

## Architecture & Technologies
This project consists of 4 isolated microservices:
1. **Frontend (React + Vite + Tailwind CSS)**: User interfaces for Admin, Staff, Student, and Public verification.
2. **Backend (Node.js + Express + MongoDB)**: Core business logic, role-based access, and database interactions.
3. **Blockchain (Hardhat + Solidity)**: Ethereum Sepolia testnet integration for certificate hash storage.
4. **AI-Service (FastAPI + Python)**: Document analysis and OCR service.

## Phase 1 Setup Instructions
Phase 1 includes the foundation for all four services without business logic.

### 1. MongoDB Atlas Configuration (Important)
Before starting the backend, you must provide a valid MongoDB Atlas connection string.
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to `.env`
3. Edit `.env` and set `MONGODB_URI=your_actual_mongodb_connection_string`. (The backend will fail to start if this is missing).

### 2. How to start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. How to start Backend
```bash
cd backend
npm install
npm start
```

### 4. How to start Blockchain Environment (Hardhat)
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
```

### 5. How to start AI Service
```bash
cd ai-service
python -m venv venv
# Activate the venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

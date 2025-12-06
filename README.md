# 🤖 RagFusion: A Document Q&A System

RagFusion is a full-stack web application designed to unlock insights from your proprietary documents using advanced Retrieval-Augmented Generation (RAG). Upload **CSV, PDF, or DOCX** files and interact with your data using natural language queries, receiving not just text answers but also **instant data visualizations** (pie charts, bar graphs).

## ✨ Key Features

* **Multi-Format Document Upload:** Supports seamless uploading and processing of **CSV, PDF, and DOCX** files (up to 50MB per file).
* **Contextual Q&A:** Leverage RAG powered by the **Gemini 2.5 Flash** model for accurate, context-aware answers grounded in your uploaded data.
* **Data Visualization:** Automatically generates and displays **pie charts and bar graphs** in the chat interface based on data queries, providing instant insights (using JFreeChart).
* **Robust Backend:** Engineered with **Spring Boot** for high-performance file handling (using Cloudinary for storage), LLM API communication, and **JWT-based** user session management.
* **Modern Frontend:** A responsive, intuitive chat interface built with **React** and **Vite**.

---

## ⚙️ Technology Stack

This project uses a powerful, enterprise-ready full-stack combination:

### 🚀 Backend (Java/Spring Boot)

| Technology | Purpose | Key Dependencies |
| :--- | :--- | :--- |
| **Spring Boot 3.x** | Core framework for the robust REST API server (running on **Java 21**). | `spring-boot-starter-web`, `spring-boot-starter-data-jpa` |
| **RAG/LLM** | RAG orchestration and LLM integration. | **LangChain4j**, **Google Gemini API** |
| **Data & Security** | Persistence, security, and authentication. | **PostgreSQL**, `spring-boot-starter-security`, **JWT (jjwt)** |
| **File Handling** | Document parsing and secure cloud storage. | `org.apache.pdfbox`, **Cloudinary** |
| **Visualization** | Server-side generation of data charts. | `org.jfree:jfreechart` |

### ⚛️ Frontend (React/Vite)

| Technology | Purpose |
| :--- | :--- |
| **React + Vite** | High-performance, type-safe frontend application. |
| **TypeScript** | Ensures code quality and maintainability. |
| **REST API** | Communicates with the Spring Boot backend. |

---

## 🛠️ Local Setup & Development

### 1. Prerequisites

* **Java 21** (or higher)
* **Maven**
* **Node.js** (LTS) & npm/yarn
* **PostgreSQL** database instance.

### 2. Backend Setup (`/ragapp`)

1.  **Configure Database:** Ensure your PostgreSQL server is running.
2.  **Environment Variables:** Create a system environment file (`.env` or similar) or configure your IDE to load the following variables.
    ```
    # Backend Local Configuration
    JWT_SECRET=your_local_jwt_secret 
    GEMINI_API_KEY=your_gemini_key
    CLOUDINARY_API_KEY=your_cloudinary_key
    CLOUDINARY_API_SECRET=your_cloudinary_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    DB_URL=jdbc:postgresql://localhost:5432/ragdb
    DB_USER=postgres
    DB_PASSWORD=mysecretpassword
    ```
3.  **Run the Application:**
    ```bash
    mvn spring-boot:run
    ```
    The Spring Boot server will run on `http://localhost:8080`.

### 3. Frontend Setup (`/frontend`)

1.  Navigate and install dependencies:
    ```bash
    cd frontend
    npm install
    ```
2.  **Configure API URL:** Create a `.env` file in the `/frontend` root:
    ```
    # .env (for local development)
    VITE_API_BASE_URL="http://localhost:8080/api" 
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The React application will usually run on `http://localhost:5173`.

---

## 🌐 Deployment Guidelines

The Spring Boot backend and React frontend are deployed independently.

### Backend Deployment (e.g., Render, Cloud VM)

Deploy your **Spring Boot** application. All sensitive configurations must be set as **Environment Variables** in your hosting service's dashboard.

| Variable Name | Purpose | Notes |
| :--- | :--- | :--- |
| **`JWT_SECRET`** | Secret key for signing and verifying JWTs (Security). | Must be a strong, random string. |
| **`GEMINI_API_KEY`** | Google API key for access to the Gemini model (RAG/LLM). | Required for all LLM calls. |
| **`CLOUDINARY_API_KEY`** | Cloudinary API Key. | Used for file management. |
| **`CLOUDINARY_API_SECRET`** | Cloudinary Secret. | Used for file management. |
| **`CLOUDINARY_CLOUD_NAME`** | Cloudinary Cloud Name. | Used for file management. |
| **`DB_URL`** | PostgreSQL JDBC connection URL. | e.g., `jdbc:postgresql://host:port/database` |
| **`DB_USER`** | PostgreSQL database username. | |
| **`DB_PASSWORD`** | PostgreSQL database password. | |

### Frontend Deployment (Vercel)

Deploy your **Vite React** application to Vercel.

* Configure the **`VITE_API_BASE_URL`** environment variable in the Vercel dashboard to point to the **public URL of your deployed Spring Boot backend**:

| Environment | Key | Value |
| :--- | :--- | :--- |
| **Production** | `VITE_API_BASE_URL` | `https://your-spring-boot-app.com/api` |

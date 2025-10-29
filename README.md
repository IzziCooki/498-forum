# 🏜️ Wild West Forum  
**Author:** Dean Hauser  
**Course:** COS 498 – Fall 2025   
**Due:** November 7, 2025, 11:59 PM  

---

## 📖 Overview
**Wild West Forum** is a deliberately insecure web forum built using **Node.js**, **Express**, and **Handlebars**, containerized with **Docker**.  

The goal of this project is to build a simple web application that demonstrates registration, login, and commenting functionality **without any security hardening**. This will serve as the foundation for learning secure web development practices later in the course.

---

## 🚀 How to Run

### Prerequisites
- Docker and Docker Compose installed on your system
- Access to a server or VPS with Docker installed

### Steps to Launch
1. **Build and start the containers:**
   ```bash
   docker compose up --build -d
   ```

2. **Access the application:**
   - Navigate to the IP address of your server/VPS in your web browser
   - Example: `http://your-server-ip`
   - The application will be running on port 80 by default

3. **Check container status:**
   ```bash
   docker compose ps
   ```

4. **View logs (if needed):**
   ```bash
   docker compose logs -f
   ```

5. **Stop the application:**
   ```bash
   docker compose down
   ```

---

## 🔧 Changing the Port

If you need to run the application on a different port, follow these steps:

> **⚠️ Important Note:** Nginx ports and backend ports have to match each other across all files.

### Step 1: Update `docker-compose.yml`
- **backend-nodejs service:**
  - Change `ports: - "8080:8080"` → `ports: - "DESIRED_PORT:DESIRED_PORT"`
  
- **my-nginx-proxy service:**
  - Change `ports: - "80:80"` → `ports: - "DESIRED_PORT:DESIRED_PORT"`
  - **This is the port where the web app will display**

### Step 2: Update `nginx/Dockerfile`
- Change `EXPOSE 80` → `EXPOSE DESIRED_PORT`

### Step 3: Update `nginx/default.conf`
- Change `listen 80;` → `listen DESIRED_PORT;`
- Change:
  ```properties
  proxy_pass http://backend-nodejs:8080;
  ```
  to:
  ```properties
  proxy_pass http://backend-nodejs:DESIRED_PORT;
  ```

### Step 4: Update `server.js`
- Change `const PORT = process.env.PORT || 8080;` → `const PORT = process.env.PORT || DESIRED_PORT;`

### Step 5: Update `backend/Dockerfile`
- Change `EXPOSE 8080` → `EXPOSE DESIRED_PORT`

### Step 6: Rebuild and restart
```bash
docker compose down
docker compose up --build -d
```

### Step 7: Access the application
- Navigate to `http://your-server-ip:DESIRED_PORT`
- Example: If you changed to port 3000, visit `http://your-server-ip:3000`

---

## ⚙️ Features

### 👤 User Accounts
- Register a username and password.
- Credentials are stored in memory (no hashing, no salting, no database).

### 🔐 Authentication
- Login creates an **insecure session cookie** (e.g., `loggedIn=true; user=<username>`).
- Logout clears both the cookie and the in-memory session.

### 💬 Comments
- Logged-in users can post comments.
- Comments include:
  - `author`
  - `text`
  - `createdAt`
- All comments are stored in memory and displayed on the feed page.

### 🧩 Views
- Built using **Handlebars** with partials for shared UI.
- Required pages:
  - Home (`/`)
  - Register (`/register`)
  - Login (`/login`)
  - Comment Feed (`/comments`)
  - New Comment Form (`/comment/new`)

---

## 🧱 In-Memory Data Model

```js
users = [
  { username: "exampleUser", password: "password123" }
];

comments = [
  { author: "exampleUser", text: "Howdy, partner!", createdAt: new Date() }
];

sessions = [
  { user: "exampleUser", sessionId: "abc123", expires: new Date() }
];
```

---

## 📝 Notes
- This application is **intentionally insecure** for educational purposes
- All data is stored in memory and will be lost when containers are stopped
- Do not use this application in production or with real user data

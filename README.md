# 🏜️ Wild West Forum  
**Author:** Dean Hauser  
**Course:** COS 498 – Fall 2025   
**Due:** November 7, 2025, 11:59 PM  

---

## 📖 Overview
**Wild West Forum** is a deliberately insecure web forum built using **Node.js**, **Express**, and **Handlebars**, containerized with **Docker**.  

The goal of this project is to build a simple web application that demonstrates registration, login, and commenting functionality **without any security hardening**. This will serve as the foundation for learning secure web development practices later in the course.

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

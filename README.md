# TaskManager

This project is a backend task management system developed as part of **Assignment 4**.  
The main goal of the assignment is to demonstrate **MVC architecture**, **authentication**, **authorization**, and **role-based access control (RBAC)** using **Node.js**, **Express**, and **MongoDB**.

---

## Features

- MVC (Model–View–Controller) architecture
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (admin / user)
- CRUD operations for multiple related entities
- Secure API endpoints
- Postman Collection for API testing

---

## Project Architecture

The project follows a clean **MVC structure**:

├── controllers/

│ ├── authController.js

│ ├── taskController.js

│ └── categoryController.js

│

├── middleware/

│ ├── authMiddleware.js

│ └── adminMiddleware.js

│

├── models/

│ ├── User.js

│ ├── Task.js

│ └── Category.js

│

├── routes/

│ ├── auth.js

│ ├── tasks.js

│ └── categories.js

│

├── public/

│ └── frontend files (HTML / CSS / JS)

│

├── .env.example

├── server.js

├── package.json

└── README.md

---

## Data Models

### User
- `email` (unique)
- `password` (hashed using bcrypt)
- `role` (`user` or `admin`)

### Task (Primary Entity)
- `title`
- `description`
- `assignedTo`
- `createdBy`
- `priority` (`low`, `medium`, `high`)
- `category` (reference to Category)

### Category (Secondary Entity)
- Used to group tasks

---

## Authentication & Security

### Password Hashing
Passwords are hashed using **bcrypt** before being stored in the database.  
Plain-text passwords are never saved.

### JWT Authentication
- JWT tokens are issued upon successful login
- Tokens are signed using a secret key stored in environment variables
- Tokens are sent via the `Authorization: Bearer <token>` header

---

## Role-Based Access Control (RBAC)

The API enforces strict RBAC rules:

| Operation | User | Admin |
|---------|------|-------|
| GET (read data) | ✅ Allowed | ✅ Allowed |
| POST (create data) | ❌ Forbidden | ✅ Allowed |
| PUT (update data) | ❌ Forbidden | ✅ Allowed |
| DELETE (remove data) | ❌ Forbidden | ✅ Allowed |

This ensures that only administrators can modify system data.

---

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/register` – Register user or admin
- `POST /api/auth/login` – Login and receive JWT token

### Tasks
- `GET /api/tasks` – Get all tasks (public)
- `POST /api/tasks` – Create task (admin only)
- `PUT /api/tasks/:id` – Update task (admin only)
- `DELETE /api/tasks/:id` – Delete task (admin only)

### Categories
- `GET /api/categories` – Get categories (public)
- `POST /api/categories` – Create category (admin only)
- `PUT /api/categories/:id` – Update category (admin only)
- `DELETE /api/categories/:id` – Delete category (admin only)

---

## API Testing (Postman)

A **Postman Collection** is included to demonstrate:

- User vs Admin permissions
- Successful requests
- Forbidden requests (403)
- JWT authentication flow

The collection includes:
- User registration and login
- Admin registration and login
- Admin-only task creation and deletion
- Failed attempts by regular users

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```
git clone <repository-url>
cd taskManager
```
### 2. Install dependencies
```
npm install
```
### 3. Environment variables

Create a .env file based on .env.example:
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=your_secret_key
```
4. Start the server
```
npm start
```
Server will run on:
```
http://localhost:3000
```

🔄 Development Notes
Global frontend state is synchronized with the backend

UI updates only after successful server responses

Validation and error handling are implemented at the model and controller levels

📌 Assignment Status
✅ All Assignment 4 requirements have been fully implemented:

MVC architecture

Authentication

RBAC

Multi-object CRUD

Postman Collection

👨‍🎓 Author
Assignment completed as part of a backend development course.

📄 License
This project is created for educational purposes only.

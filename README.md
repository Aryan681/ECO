# **🌿 Eco - A Personalized Developer Ecosystem**

🚀 **Eco** is a powerful, all-in-one ecosystem designed for developers to streamline coding, collaboration, and project management. It integrates a **code editor, compiler, version control, and cloud-based execution**, making it a **next-gen developer workspace**.

## **✨ Features**

- 🔥 **Online Code Editor** – Write, run, and test code in multiple languages  
- 🐳 **Dockerized Execution** – Secure and isolated code execution using **Docker containers**  
- ⚡ **Real-time Collaboration** – Work with team members in a **live coding environment**  
- 🗃️ **Hybrid Database (PostgreSQL + MongoDB)** – Structured & unstructured data handling  
- 🔑 **Authentication via GitHub OAuth** – Secure login using **GitHub integration**  
- 📦 **GitHub Repository Management** – Create, list, delete, and manage repositories via API  
- 📊 **Analytics & Logs** – Monitor project activities and execution logs  
- ☁️ **Cloud-based Execution** – Run code efficiently on cloud infrastructure  

---

## **🚀 Tech Stack**

| Technology   | Usage |
|-------------|--------|
| **Node.js** | Backend Server |
| **Express.js** | API Framework |
| **React.js** | Frontend UI |
| **Docker** | Containerized Code Execution |
| **Kubernetes** | Orchestration for containers |
| **Redis** | Caching & Rate Limiting |
| **PostgreSQL** | Structured Data Storage |
| **MongoDB** | Unstructured Data Storage |
| **Prisma ORM** | Database Management |
| **GitHub API** | Repository & OAuth Integration |

---

## **🛠️ Installation & Setup**

### **🔹 Prerequisites**
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/)  
- [Docker](https://www.docker.com/)  
- [PostgreSQL](https://www.postgresql.org/)  
- [MongoDB](https://www.mongodb.com/)  

### **🔹 Clone the Repository**
```sh
git clone https://github.com/Aryan681/eco.git
cd eco
```

### **🔹 Install Dependencies**
```sh
npm install
```

### **🔹 Set Up Environment Variables**
Create a **.env** file and add:
```sh
PORT=3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/github/callback
JWT_ACCESS_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://user:password@localhost:5432/eco
MONGO_URI=mongodb://localhost:27017/eco
```

### **🔹 Start the Server**
```sh
npm start
```
Server will run at **http://localhost:3000**  

---

## **📌 API Endpoints**

### **🔐 Authentication**
| Method | Endpoint | Description |
|--------|---------|------------|
| `GET` | `/api/auth/github` | Redirect to GitHub OAuth |
| `GET` | `/api/github/callback` | GitHub OAuth Callback |
| `GET` | `/api/auth/me` | Get authenticated user info |

### **📂 GitHub Repository Management**
| Method | Endpoint | Description |
|--------|---------|------------|
| `GET` | `/api/github/repos` | List all GitHub repositories |
| `POST` | `/api/github/repos` | Create a new repository |
| `DELETE` | `/api/github/repos/:owner/:repo` | Delete a repository |

---

## **🤝 Contributing**
We welcome contributions!  
1. Fork the repository  
2. Create a new branch (`git checkout -b feature-name`)  
3. Commit changes (`git commit -m "Added new feature"`)  
4. Push to GitHub (`git push origin feature-name`)  
5. Open a **Pull Request** 🚀  

---

## **🛡️ License**
This project is licensed under the **MIT License**.  

---

## **📬 Contact & Support**
👤 **Author:** Aryan Singh  
📧 Email: [Aryannaruka7@gmail.com](mailto:Aryannaruka7@gmail.com)  
🌍 GitHub: [Aryan681](https://github.com/Aryan681)  

---

### **🚀 Start Coding with Eco Now!**
```sh
git clone https://github.com/Aryan681/eco.git
npm install
npm start
```  
🔥 **Happy Coding!** 🔥  

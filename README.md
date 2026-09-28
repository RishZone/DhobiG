# 🧺 DhobiG

> **A full-stack smart laundry platform with AI-powered assistance, service booking, order management, and an intelligent RAG-based chatbot.**

DhobiG is a modern laundry management platform designed to provide a seamless **customer-to-order experience** — from browsing laundry services and booking pickups to tracking orders and interacting with an AI assistant.

---

## 🏠 Home

The DhobiG home page provides a simple and modern interface where customers can:

* 🧺 Explore available laundry services
* 📦 Quickly book a pickup
* 🚚 Track ongoing orders
* ⭐ View services and customer reviews
* 🤖 Access the AI Assistant
* 📍 Manage pickup and delivery addresses
  <img width="959" height="466" alt="image" src="https://github.com/user-attachments/assets/1af2dbf3-9b42-40d3-a7a7-dfe451eae83f" />


---

## 🧺 Services

Customers can browse available laundry services and select the services they need.

### Available functionality

* View laundry services
* View service details
* Select required services
* Choose quantity
* Calculate order pricing
* Add services to an order
* Proceed to booking

---

## 📦 Book Pickup & Order

DhobiG provides an end-to-end order booking workflow.

```text
Select Service
      ↓
Choose Quantity
      ↓
Select Address
      ↓
Schedule Pickup
      ↓
Confirm Order
      ↓
Order Created
```

Customers can book laundry pickups and manage their orders through the application.

---

## 🚚 Order Tracking

Customers can view the current status of their laundry orders.

### Order lifecycle

```text
Order Placed
     ↓
Pickup Scheduled
     ↓
Picked Up
     ↓
Processing
     ↓
Ready
     ↓
Out for Delivery
     ↓
Delivered
```

The order status allows customers to understand where their laundry is in the process.

---

## 🤖 AI Assistant

DhobiG includes an AI-powered assistant designed to help customers interact with the laundry platform.

The assistant can help users with:

* 🧺 Laundry service information
* 📦 Order-related queries
* 💰 Pricing-related questions
* 📍 Pickup and delivery information
* ❓ General DhobiG questions
* 💬 Natural-language conversations

---

## 🧠 RAG-Powered AI

The AI Assistant uses a **Retrieval-Augmented Generation (RAG)** approach to provide responses based on relevant application knowledge.

### RAG Pipeline

```text
User Question
      ↓
Query Processing
      ↓
Vector Search
      ↓
Relevant Knowledge Retrieval
      ↓
Context + User Query
      ↓
LLM
      ↓
AI Response
```

### AI Technologies

* LangChain
* LangGraph
* ChromaDB
* Sentence Transformers
* Ollama / LLM
* Embeddings
* Vector Search
* RAG

---

## 🕸️ Agentic AI

DhobiG is designed to move beyond a simple chatbot by integrating **agentic AI concepts**.

The AI assistant can be extended to work with application tools and workflows instead of only generating text.

### Agentic Workflow

```text
User Request
      ↓
AI Agent
      ↓
Understand Intent
      ↓
Select Appropriate Tool
      ↓
Execute Action
      ↓
Retrieve Result
      ↓
Generate Response
```

This architecture can support intelligent workflows such as:

* 🔎 Finding services
* 📦 Checking order information
* 📍 Working with addresses
* 🧺 Assisting with bookings
* 🤖 Using application APIs as AI tools

---

## 🔐 Authentication

DhobiG provides secure authentication and role-based access.

### Customer

* Register
* Login
* Manage profile
* Manage addresses
* Book orders
* Track orders
* Use AI Assistant

### Admin

* Admin authentication
* Manage services
* Manage orders
* Manage users
* Manage drivers
* Manage coupons
* Manage reviews

---

## ⭐ Reviews & Ratings

Customers can provide feedback after using the laundry service.

* Submit reviews
* Add ratings
* View customer feedback

---

## 📍 Address Management

Customers can manage their pickup and delivery addresses.

* Add address
* Update address
* Delete address
* Select address during booking

---

## 🎟️ Coupons

DhobiG supports coupon-based discounts during the ordering process.

```text
Order
  ↓
Apply Coupon
  ↓
Validate Coupon
  ↓
Calculate Discount
  ↓
Final Amount
```

---

## 💳 Payment

The platform is designed with payment functionality as part of the order workflow.

The payment layer is integrated with the backend API and order management system.

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Axios
* React Hook Form
* Zod
* shadcn/ui
* Framer Motion

## Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* JWT Authentication
* REST APIs

## AI / GenAI

* LangChain
* LangGraph
* RAG
* ChromaDB
* Sentence Transformers
* Ollama
* LLMs
* Vector Embeddings
* AI Agents
* Prompt Engineering

## Development

* Git
* GitHub
* Postman
* Docker
* REST APIs

---

# 🏗️ Architecture

```text
                    ┌──────────────────┐
                    │    React App     │
                    │   TypeScript     │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ↓
                    ┌──────────────────┐
                    │     FastAPI      │
                    │     Backend      │
                    └────────┬─────────┘
                             │
             ┌───────────────┼───────────────┐
             ↓               ↓               ↓
        PostgreSQL       AI Assistant     Services
             │               │               │
             │          ┌────┴────┐          │
             │          ↓         ↓          │
             │        RAG      AI Agent      │
             │          │         │          │
             │          ↓         ↓          │
             │      ChromaDB   Tools/APIs   │
             │                                │
             └────────────────────────────────┘
```

---

# 📂 Project Structure

```text
DhobiG/
│
├── AI/
│
├── Backend/
│   ├── app/
│   ├── migrations/
│   └── requirements.txt
│
├── Database/
│
├── Docker/
│
├── docs/
│
└── Frontend/
    └── my-react-app/
```

---

# 💻 Run Locally

### Backend

```bash
cd Backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd Frontend/my-react-app

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🚀 Future Improvements

* 📱 Mobile application
* 💳 Production payment gateway
* 🔔 Real-time order notifications
* 🗺️ Live pickup/delivery tracking
* 🤖 More autonomous AI workflows
* 🧠 Improved RAG knowledge base
* 🔧 More AI tools for the agent
* 📊 Advanced admin analytics

---

# 👨‍💻 Developer

**Rishabh Chaudhary**

GitHub: [RishZone](https://github.com/RishZone)

---

## ⭐ Project

DhobiG combines **full-stack development, REST APIs, database management, RAG, Generative AI, and Agentic AI** into a single real-world laundry management platform.

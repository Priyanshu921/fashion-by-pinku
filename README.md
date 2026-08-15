# Fashion By Pinku

A premium, full-stack E-commerce web application tailored for modern fashion. Features a highly responsive UI, secure payment gateway integration, seamless admin dashboard, and robust user management.

## 🌟 Features

- **Responsive & Premium UI:** Built with React, Tailwind CSS 4, and Framer Motion for sleek animations across mobile, tablet, and desktop devices.
- **Secure Authentication:** JWT-based authentication via Passport.js, supporting user roles (Admin & Customer).
- **Product & Category Management:** Admins can effortlessly create, edit, and categorize products directly from the Business Cockpit dashboard.
- **Shopping Cart & Checkout:** Slide-out interactive cart with real-time updates and seamless checkout flow.
- **Payment Integration:** Secure checkout powered by Razorpay.
- **Media Uploads:** Cloudinary integration for robust image storage and delivery.
- **Order Tracking:** Automated tracking links for major Indian logistics providers (Delhivery, BlueDart, DTDC, India Post).
- **Keep-Alive System:** In-built NestJS cron jobs and GitHub Actions to prevent free-tier hosting cold starts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Icons & UI:** Lucide React, Sonner (Toasts)
- **Routing:** React Router v7

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (via Docker)
- **ORM:** Sequelize (sequelize-typescript)
- **Authentication:** Passport, bcrypt, @nestjs/jwt
- **Integrations:** Razorpay (Payments), Cloudinary (Images)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) (for running the PostgreSQL database locally)

### 1. Clone the repository
```bash
git clone https://github.com/Priyanshu921/fashion-by-pinku.git
cd fashion-by-pinku
```

### 2. Setup the Database (Docker)
The project includes a `docker-compose.yml` to instantly spin up a configured PostgreSQL database matching the local `.env` settings.

```bash
# Start the database in the background
docker compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on the variables listed in the **Environment Variables** section below.

Run database migrations:
```bash
npx sequelize-cli db:migrate
```

Start the development server:
```bash
npm run start:dev
```
*The backend will run on `http://localhost:3000`*

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (if required by your frontend logic) or simply run the development server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Database Connection
DATABASE_URL="postgres://contextra:contextrapassword@localhost:5432/fashion_db"

# JWT Auth Secret
JWT_SECRET="super_secret_jwt_key_123"

# Cloudinary Integration (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay Integration (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Setup
ADMIN_PASSWORD=Pinku@Fashion2026!

# Keep-Alive Configuration (Production only)
NODE_ENV=development
APP_URL=http://localhost:3000
```

---

## 📂 Project Structure

```
fashion-by-pinku/
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── addresses/        # User address management
│   │   ├── auth/             # JWT Authentication
│   │   ├── categories/       # Category endpoints
│   │   ├── db/               # Sequelize config & migrations
│   │   ├── health/           # Health check endpoint for uptime monitors
│   │   ├── keep-alive/       # Internal cron job to prevent cold starts
│   │   ├── models/           # Sequelize database models
│   │   ├── orders/           # Order & Checkout logic
│   │   └── products/         # Product endpoints & Cloudinary upload
│   └── package.json
│
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── layouts/          # Page wrappers (MainLayout with Cart Drawer)
│   │   └── pages/            # Main views (Home, ProductDetails, AdminDashboard, etc.)
│   └── package.json
│
├── .github/workflows/        # GitHub Actions (e.g., keep-alive.yml)
├── docker-compose.yml        # PostgreSQL database container config
└── README.md                 # Project documentation
```

---

## ☁️ Deployment Notes (Render)

This application includes built-in safeguards against free-tier cold starts on hosting platforms like Render.

1. **Keep-Alive Service:** An internal NestJS `@Cron` job pings the `/api/health` endpoint every 12 minutes. 
   *(Requires `NODE_ENV=production` and `APP_URL` in your deployment environment variables).*
2. **GitHub Actions:** A fallback cron job (`.github/workflows/keep-alive.yml`) pings the server every 10 minutes from GitHub.
   *(Requires a `RENDER_BACKEND_URL` repository secret).*
3. **External Monitors:** You can freely hook up UptimeRobot or cron-job.org to ping the `GET /api/health` endpoint every 5-10 minutes for ultimate reliability.

---
*Built with ❤️ for fashion.*

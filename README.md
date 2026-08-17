# LeadFlow CRM

A full-stack Client Relationship Management system for managing leads, tracking conversions, and growing your business efficiently.

## Features

- **Lead Management** — Create, read, update, and delete client leads
- **Authentication** — JWT-based admin login with bcrypt password hashing
- **Lead Notes** — Add follow-up notes to individual leads
- **Status Tracking** — Track leads as New → Contacted → Converted
- **Analytics Dashboard** — Real-time stats on leads, conversions, and performance
- **Lead Submission** — Public form for clients to submit their info directly
- **Responsive UI** — Works on desktop, tablet, and mobile

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Router DOM
- Axios (HTTP client)
- Context API (state management)
- CSS3 (custom styles, no framework)

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- dotenv (env config)
- CORS middleware

## Project Structure

```
leadflow-crm/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   └── LeadDetailPanel.jsx
│   │   ├── context/           # Auth context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Route pages
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                    # Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Login, profile, seeding
│   │   ├── leadController.js  # Lead CRUD + notes
│   │   └── statsController.js # Public stats endpoint
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── Admin.js           # Admin schema (bcrypt)
│   │   └── Lead.js            # Lead schema with notes
│   ├── routes/
│   │   ├── authRoutes.js      # POST /api/auth/login, GET /api/auth/me
│   │   └── leadRoutes.js      # /api/leads CRUD + notes
│   ├── server.js              # Entry point
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone and Install

```bash
git clone <repo-url>
cd leadflow-crm

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Environment Variables

Copy `.env.example` to create your `.env` files:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/leadflow_crm?retryWrites=true&w=majority
JWT_SECRET=<your-random-secret-key>
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@crm.com
ADMIN_PASSWORD=<your-secure-password>
```

**Important:** The server loads the root `.env` file. Make sure `MONGODB_URI` points to your MongoDB Atlas cluster.

### 3. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get the connection string and add it to your `.env` as `MONGODB_URI`

### 4. Run the Application

**Backend (port 5000):**
```bash
cd server
npm run dev
```

**Frontend (port 5173):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Admin login, returns JWT |
| GET | `/api/auth/me` | Protected | Get current admin profile |

### Leads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leads` | Protected | List all leads |
| GET | `/api/leads/:id` | Protected | Get single lead |
| POST | `/api/leads` | Public | Create a new lead |
| PUT | `/api/leads/:id` | Protected | Update a lead |
| DELETE | `/api/leads/:id` | Protected | Delete a lead |
| POST | `/api/leads/:id/notes` | Protected | Add a note to a lead |

### Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | Public | Get lead stats (total, converted, etc.) |
| GET | `/api/health` | Public | Server health check |

## Authentication Flow

1. Admin submits email + password to `POST /api/auth/login`
2. Server validates credentials with bcrypt
3. Server returns a JWT token (expires in 7 days)
4. Client stores token in `localStorage`
5. Client sends `Authorization: Bearer <token>` header on protected routes
6. `authMiddleware.protect` verifies the token and attaches `req.admin`
7. On 401 response, client auto-logs out and redirects to login

## Lead CRUD

- **Create:** `POST /api/leads` — requires `name`, `email`; optional `phone`, `source`, `status`, `notes`
- **Read:** `GET /api/leads` returns all leads sorted by newest first
- **Update:** `PUT /api/leads/:id` — partial updates supported
- **Delete:** `DELETE /api/leads/:id` — permanently removes the lead
- **Notes:** `POST /api/leads/:id/notes` — appends a note with `{ text: "..." }`

## Validation and Security

- Email format validation (regex)
- Field length limits (name: 200, email: 254, phone: 30, source: 100, notes: 2000)
- Status enum: `new`, `contacted`, `converted`
- Passwords hashed with bcrypt (10 salt rounds)
- JWT expiration (7 days)
- CORS configured for specific origins
- JSON body limit: 1MB
- Error messages sanitized (no internal details leaked)
- Auto-seeding of default admin on first run (when Admin collection is empty)

## Responsive Design

- **Desktop (1200px+):** Side-by-side two-column login layout
- **Tablet (768px-1200px):** Stacked layout, cards adapt
- **Mobile (less than 768px):** Single column, compact spacing

## Troubleshooting

**MongoDB connection error (ECONNREFUSED):**
- Check that `MONGODB_URI` in your root `.env` points to your Atlas cluster, not `localhost`
- Verify your IP is whitelisted in Atlas
- Confirm the database user credentials are correct

**CORS errors:**
- Ensure `CLIENT_URL` in `.env` matches the frontend URL (e.g., `http://localhost:5173`)
- For IPv6, add `http://[::1]:5173` to the allowed origins

**Port conflicts:**
- Backend defaults to port 5000, frontend to 5173
- Change `PORT` in `.env` if 5000 is in use
- Vite will auto-pick another port if 5173 is occupied

**Admin login fails:**
- The admin account is seeded once on first run from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars
- Changing env vars later does not update the existing admin
- If you need to reset, drop the `admins` collection in MongoDB and restart the server

## License

This project was built as part of the FutureSkillz Full-Stack internship program.

# ⚡ LifeOS – Discipline System

A full-stack gamified discipline tracking app built with React + Node.js + MongoDB.

---

## 🗂 Project Structure

```
lifeos/
├── client/                     # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Sidebar + mobile nav
│   │   │   ├── TaskCard.jsx        # Expandable task card
│   │   │   └── AddTaskModal.jsx    # New task modal
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # Daily task dashboard
│   │   │   ├── ReportsPage.jsx     # Weekly analytics + charts
│   │   │   ├── ChallengesPage.jsx  # Challenge tracker
│   │   │   ├── ProfilePage.jsx     # User profile + badges
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT auth state
│   │   └── utils/
│   │       ├── api.js              # Axios instance
│   │       └── gamification.js    # XP, levels, badges, memes
│   └── package.json
│
└── server/                     # Node.js + Express backend
    ├── models/
    │   ├── User.js                 # User + XP + badges
    │   ├── Task.js                 # Tasks + proof
    │   └── Challenge.js           # Challenge + streak
    ├── routes/
    │   ├── auth.js                 # Login / signup / profile
    │   ├── tasks.js                # CRUD + proof upload
    │   ├── challenges.js           # Start / checkin / miss
    │   └── reports.js             # Weekly analytics + send
    ├── middleware/
    │   └── auth.js                 # JWT protect middleware
    ├── utils/
    │   └── notifications.js       # Nodemailer + Twilio
    ├── uploads/                    # Local proof file storage
    ├── index.js                    # Express app entry point
    └── .env.example
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for email reports)
- Twilio account (optional, for WhatsApp)

### 1. Clone & Install

```bash
git clone <your-repo>
cd lifeos

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lifeos
JWT_SECRET=change_this_to_a_long_random_string

# Gmail (enable 2FA + use App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16char_app_password

# Twilio WhatsApp (optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

CLIENT_URL=http://localhost:5173
```

#### Gmail App Password Setup:
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Search "App passwords" → generate for "Mail"
4. Use that 16-character password as `EMAIL_PASS`

#### Twilio WhatsApp Setup:
1. Sign up at https://twilio.com
2. Activate the WhatsApp Sandbox
3. Copy your Account SID and Auth Token
4. Have contacts send the join code to +14155238886

### 3. Start Development

Open two terminals:

**Terminal 1 – Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### 4. Open the App

Visit: **http://localhost:5173**

Create your account → start tracking!

---

## ✨ Features

### 📋 Dashboard
- Daily task management (add / edit / delete / complete)
- 4 categories: Coding 💻, Study 📚, Fitness 🏃, Personal Growth 🧠
- **Discipline Score** = (completed / total) × 100
- Animated progress bar
- Dynamic motivational messages (roasts when low, hype when high)
- Meme system based on performance

### 🎮 Gamification
- **+10 XP** per completed task, **-5 XP** per missed
- **Levels:** Beginner → Warrior → Legend
- **Badges:** First Step, 10 Tasks, 50 Tasks, On Fire, Unstoppable, Warrior, Legend
- Real-time XP bar in sidebar

### 📊 Weekly Reports
- Line chart: daily completion rate
- Bar chart: tasks per day
- Category breakdown with progress bars
- Auto-generated motivational summary
- Send to friend + parent via email & WhatsApp

### 🔥 Challenges
- 7-Day Coding Challenge
- 21-Day Discipline Challenge
- 30-Day Transformation
- Streak counter with day-dot grid
- Strict mode: miss a day → streak resets to 0

### 📎 Proof Upload
- Attach image/PDF proof to any completed task
- Files stored locally in `server/uploads/proofs/`

### 👤 Profile
- Edit accountability contacts (email + WhatsApp)
- View earned badges
- Level progress bar

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/tasks?date=YYYY-MM-DD` | Get tasks for date |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/proof` | Upload proof |
| GET | `/api/tasks/range?start=&end=` | Get tasks in range |
| GET | `/api/reports/weekly` | Get weekly analytics |
| POST | `/api/reports/send` | Send report to contacts |
| GET | `/api/challenges` | Get user challenges |
| POST | `/api/challenges/start` | Start a challenge |
| POST | `/api/challenges/:id/checkin` | Check in for today |
| POST | `/api/challenges/:id/miss` | Mark day missed |
| DELETE | `/api/challenges/:id` | Remove challenge |

---

## 🌐 Production Deployment

### MongoDB Atlas
1. Create free cluster at https://cloud.mongodb.com
2. Replace `MONGODB_URI` with your Atlas connection string

### Backend (Railway / Render)
1. Push to GitHub
2. Connect repo to Railway/Render
3. Add all environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your deployed backend URL
2. Update `vite.config.js` proxy OR use full URLs in `api.js`
3. Deploy `client/` folder

---

## 🤝 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Toast | react-hot-toast |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail) |
| WhatsApp | Twilio |
| File Upload | Multer |
| Cron Jobs | node-cron |

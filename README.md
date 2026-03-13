# ⚡ Zenith (Tack)

**Zenith** is an award-winning style productivity orchestration engine designed for high-performance individuals. Built with a focus on deep work, consistency, and gamified mastery, it provides a monochrome, distraction-free environment to manage your life's throughput.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-black?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-black?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Typescript](https://img.shields.io/badge/Typescript-5.0-black?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## ✨ Core Philosophy
- **Monochrome Minimalism**: A design language that removes visual noise, letting you focus on what matters.
- **Deep Work (Focus Mode)**: Integrated pomodoro and deep-focus timers with ambient soundscapes.
- **Mastery Through Data**: Habits and tasks categorized by the Eisenhower Matrix to optimize decision-making.
- **Progress Gamification**: Real-world productivity translated into XP, Ranks, and Achievements.

---

## 🛠 Features (Completed)

### 📊 Day Planner & Eisenhower Matrix
- **Priority-First Tasking**: Categorize tasks into Eisenhower quadrants (Urgent/Important) to identify high-leverage actions.
- **Time Estimation**: Assign time values to tasks to track daily capacity and avoid burnout.
- **Monochrome Dashboard**: A sleek, high-contrast interface for daily task execution.

### 📊 Analytics Dashboard
- **Productivity Trends**: Visualize task completion and focus minutes over weekly, monthly, and yearly timeframes.
- **Quadrant Distribution**: Analyze how your time is split across the Eisenhower Matrix.
- **Consistency Heatmap**: Track your daily activity patterns (similar to GitHub contributions).
- **Export Capabilities**: Download your productivity data for external analysis.

### 🔄 Habit Mastery
- **14-Day Consistency View**: Track your daily rituals and build long-term streaks.
- **Instant Persistence**: All data is persisted to local storage for immediate feedback and zero-latency performance.

### 🧘 Focus Mode (v2.0)
- **Short Mode**: Agile 15-45 minute pomodoro sessions for quick wins.
- **Long Mode (Deep Focus)**: 60-120 minute deep work blocks tied to specific tasks.
- **Ambient Landscapes**: Built-in Rain and Lofi soundtracks to facilitate flow state.
- **Motivational Engine**: Dynamic quotes to keep you centered during intense focus periods.

### 🏆 Gamification Engine
- **Rank System**: Progress from **Bronze I** to **Grandmaster** based on your productivity output.
- **XP Ecosystem**: Earn XP for completing tasks, finishing focus sessions, and maintaining streaks.
- **Achievements**: Unlock milestones like "Focus Novice", "Week Warrior", and "Productivity Master".
- **Dynamic Scaling**: XP rewards scale with your rank, ensuring the challenge grows as you do.

---

## 🛠 Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS 4.0 (Monochrome Design System)
- **Icons**: Lucide React
- **Visualization**: Recharts
- **State Management**: Context API (Auth, Theme, Gamification)
- **Persistence**: LocalStorage (Current) / Firebase & MongoDB (Planned)

---

## 🚀 Future Scopes (Roadmap)

### 📈 Phase 1: Real-world Data Integration
- **Live Data Streams**: Replace current mock analytics with real-time data from user activity logs.
- **Historical Back-filling**: Support for importing legacy productivity data from other platforms.

### 🌐 Phase 2: Real-time & Social
- **Real-time Synchronization**: Migration to Socket.io for instant level-up notifications and cross-device syncing.
- **Leaderboards**: Compete with friends or the global community (Elite Ranks).

### 🤖 Phase 3: Backend & Scale
- **Database Migration**: Move from LocalStorage to **MongoDB/PostgreSQL** for robust data persistence.
- **Cron Orchestration**: Automated daily resets, weekly reports, and streak verification via Node-cron.
- **Advanced Auth**: Secure authentication with detailed profile customization and avatar support.

### ⚡ Phase 4: Intelligence
- **Focus Guard**: Minimum time requirements and "deep focus" lockouts to prevent productivity hacking.
- **Smart Scheduling**: AI-driven task suggestions based on historical energy levels and priority.

---

## 🛫 Getting Started

### Prerequisites
- Node.js 20+ 
- npm / yarn / pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tack.git
   cd tack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to start your productivity journey.

---

## 📁 Project Structure
```text
tack/
├── app/                  # Next.js App Router (Pages & Layouts)
├── components/           # Reusable UI Components
├── contexts/             # Global State (Auth, Theme, Gamification)
├── lib/                  # Utilities and Helper Functions
├── public/               # Static Assets
└── todo.md               # Detailed development log and future plans
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Created with passion for high-performance productivity.*

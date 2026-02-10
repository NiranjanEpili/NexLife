<div align="center">

# 🌟 NexLife

### *Your All-in-One Life Management Platform*

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&multiline=true&width=600&height=100&lines=Manage+Tasks+%F0%9F%93%8B;Track+Expenses+%F0%9F%92%B0;Plan+Events+%F0%9F%93%85;Organize+Life+%E2%9C%A8" alt="Typing SVG" />
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Next.js-13.x-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/github/license/yourusername/nexlife?style=for-the-badge" alt="License"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Maintained-Yes-green?style=for-the-badge" alt="Maintained"/></a>
</p>

---

### ⚡ Built with cutting-edge technologies for a seamless experience

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 **Authentication**
```
✓ Email/Password Login
✓ Google OAuth Integration  
✓ Secure Session Management
✓ Auto Token Refresh
```

</td>
<td width="50%">

### 📋 **Task Management**
```
✓ Create & Organize Tasks
✓ Priority Levels
✓ Status Tracking
✓ Due Date Reminders
```

</td>
</tr>

<tr>
<td width="50%">

### 💰 **Expense Tracking**
```
✓ Income/Expense Recording
✓ Category Organization
✓ Budget Calculator
✓ Indian Rupees (₹) Format
```

</td>
<td width="50%">

### 📅 **Calendar Events**
```
✓ Event Scheduling
✓ Color-Coded Events
✓ Time Management
✓ Event Reminders
```

</td>
</tr>

<tr>
<td width="50%">

### 📚 **Academics**
```
✓ Subject Management
✓ File Attachments
✓ Progress Tracking
✓ Resource Links
```

</td>
<td width="50%">

### 🛒 **Shopping Lists**
```
✓ Multiple Lists
✓ Category Items
✓ Quantity Tracking
✓ Completion Status
```

</td>
</tr>
</table>

<div align="center">

### 🎨 **Beautiful & Modern UI**

![Responsive](https://img.shields.io/badge/📱_Responsive-100%25-blue?style=for-the-badge)
![Dark Mode](https://img.shields.io/badge/🌙_Dark_Mode-Enabled-purple?style=for-the-badge)
![Animations](https://img.shields.io/badge/✨_Animations-Smooth-orange?style=for-the-badge)

</div>

---

## 🛠️ Tech Stack

<div align="center">

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
<br>Next.js
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=typescript" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=supabase" width="48" height="48" alt="Supabase" />
<br>Supabase
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
<br>Vercel
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
<br>PostgreSQL
</td>
</tr>
</table>

</div>

---

## 🚀 Getting Started

<details>
<summary><b>📦 Installation Steps</b></summary>

### 1️⃣ Clone the repository

```bash
git clone <your-repository-url>
cd NexLife
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Set up environment variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Set up Supabase Database

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the content from `supabase/migrations/20260210171839_create_nexlife_schema.sql`
4. Paste and run the SQL to create all tables

### 5️⃣ Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase Dashboard → Authentication → Providers → Google

### 6️⃣ Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

</details>

---

## 📁 Project Structure

```
📦 NexLife
┣ 📂 app                      # Next.js app directory
┃ ┣ 📂 academics              # 📚 Academics management
┃ ┣ 📂 calendar               # 📅 Calendar events
┃ ┣ 📂 dashboard              # 🏠 Main dashboard
┃ ┣ 📂 expenses               # 💰 Expense tracking
┃ ┣ 📂 login                  # 🔐 Login page
┃ ┣ 📂 signup                 # ✍️ Signup page
┃ ┣ 📂 tasks                  # ✅ Task management
┃ ┣ 📂 shopping               # 🛒 Shopping lists
┃ ┗ 📜 layout.tsx             # Root layout
┣ 📂 components               # React components
┃ ┣ 📂 layout                 # Layout components
┃ ┗ 📂 ui                     # UI components (Radix)
┣ 📂 contexts                 # React contexts
┃ ┗ 📜 AuthContext.tsx        # Authentication
┣ 📂 lib                      # Utilities
┃ ┣ 📂 supabase               # Supabase client
┃ ┗ 📜 utils.ts               # Helpers
┣ 📂 public                   # Static assets
┗ 📂 supabase                 # Database migrations
  ┗ 📂 migrations             # SQL migrations
```

---

## 🗄️ Database Schema

<div align="center">

```mermaid
erDiagram
    USER_PROFILES ||--o{ TASKS : creates
    USER_PROFILES ||--o{ EXPENSES : records
    USER_PROFILES ||--o{ CALENDAR_EVENTS : schedules
    USER_PROFILES ||--o{ ACADEMICS : manages
    USER_PROFILES ||--o{ SHOPPING_LISTS : owns
    SHOPPING_LISTS ||--o{ SHOPPING_ITEMS : contains
    
    USER_PROFILES {
        uuid id PK
        text email
        text full_name
        text theme_preference
    }
    
    TASKS {
        uuid id PK
        uuid user_id FK
        text title
        text priority
        text status
    }
    
    EXPENSES {
        uuid id PK
        uuid user_id FK
        numeric amount
        text type
        text category
    }
```

</div>

<p align="center"><b>🔒 All tables have Row Level Security (RLS) enabled</b></p>

---

## 🔒 Security

<div align="center">

| Feature | Status | Description |
|---------|--------|-------------|
| 🛡️ **RLS** | ✅ Enabled | Row Level Security on all tables |
| 🔐 **Auth** | ✅ Required | User authentication for operations |
| 🔄 **Sessions** | ✅ Secure | Auto token refresh & management |
| 🚪 **Routes** | ✅ Protected | Authentication checks on routes |

</div>

---

## 🌐 Deployment

<div align="center">

### 🚀 Deploy to Vercel in Minutes!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

</div>

<details>
<summary><b>📘 Deployment Guide</b></summary>

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** 🎉

### Step 3: Post-Deployment

- Update Supabase URL Configuration
- Add Vercel URL to Google OAuth redirect URIs

</details>

---

## 📝 Available Scripts

<div align="center">

| Command | Description | Usage |
|---------|-------------|-------|
| 🔧 `npm run dev` | Start development server | Local development |
| 🏗️ `npm run build` | Build for production | Production build |
| ▶️ `npm start` | Start production server | Run production |
| 🔍 `npm run lint` | Run ESLint | Code linting |
| 📘 `npm run typecheck` | Type checking | TypeScript check |

</div>

---

## 🤝 Contributing

<div align="center">

**Contributions are always welcome!** 💙

<table>
<tr>
<td>

1. 🍴 Fork the Project
2. 🌿 Create Feature Branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. 💾 Commit Changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. 📤 Push to Branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. 🔃 Open Pull Request

</td>
</tr>
</table>

</div>

---

## 📄 License

<div align="center">

This project is open source and available under the [MIT License](LICENSE).

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

## 🙏 Acknowledgments

<div align="center">

<table>
<tr>
<td align="center">
<a href="https://nextjs.org/">
<img src="https://skillicons.dev/icons?i=nextjs" width="50" height="50" alt="Next.js"/><br/>
<b>Next.js</b>
</a>
</td>
<td align="center">
<a href="https://supabase.com/">
<img src="https://skillicons.dev/icons?i=supabase" width="50" height="50" alt="Supabase"/><br/>
<b>Supabase</b>
</a>
</td>
<td align="center">
<a href="https://www.radix-ui.com/">
<img src="https://avatars.githubusercontent.com/u/75042455?s=200&v=4" width="50" height="50" alt="Radix UI"/><br/>
<b>Radix UI</b>
</a>
</td>
<td align="center">
<a href="https://tailwindcss.com/">
<img src="https://skillicons.dev/icons?i=tailwind" width="50" height="50" alt="Tailwind"/><br/>
<b>Tailwind CSS</b>
</a>
</td>
<td align="center">
<a href="https://lucide.dev/">
<img src="https://lucide.dev/logo.light.svg" width="50" height="50" alt="Lucide"/><br/>
<b>Lucide Icons</b>
</a>
</td>
</tr>
</table>

</div>

---

<div align="center">

## 📧 Contact & Support

<p>For any queries or support, please open an issue in the repository.</p>

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/yourusername/nexlife/issues)
[![Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?style=for-the-badge&logo=github)](https://github.com/yourusername/nexlife/discussions)

---

### Made with ❤️ using Next.js and Supabase

<p>
  <img src="https://img.shields.io/badge/⭐-Star_this_repo-yellow?style=for-the-badge" alt="Star"/>
</p>

**If you found this helpful, please consider giving it a ⭐**

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

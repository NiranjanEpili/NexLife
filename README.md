# NexLife

A comprehensive life management platform built with Next.js and Supabase. Manage your tasks, expenses, calendar, academics, and shopping lists all in one place.

![NexLife](https://img.shields.io/badge/Next.js-13.x-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔐 **Authentication**
  - Email/Password authentication
  - Google OAuth sign-in
  - Secure session management with Supabase Auth

- 📋 **Task Management**
  - Create, update, and delete tasks
  - Priority levels (Low, Medium, High, Urgent)
  - Task status tracking (Todo, In Progress, Completed)
  - Due date management

- 💰 **Expense Tracking**
  - Track income, expenses, and investments
  - Category-based organization
  - Monthly statistics and insights
  - Budget calculator with multiple ratio options (50/30/20, 60/30/10, 70/20/10)
  - Indian Rupees (₹) currency format

- 📅 **Calendar**
  - Event scheduling and management
  - Color-coded events
  - Time-based event tracking

- 📚 **Academics**
  - Subject management
  - File attachments
  - Study progress tracking
  - Resource links organization

- 🛒 **Shopping Lists**
  - Multiple shopping lists
  - Category-based items
  - Quantity tracking
  - Checkbox completion

- 🎨 **Modern UI**
  - Responsive design for all devices
  - Dark mode support
  - Beautiful gradient themes
  - Radix UI components with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for OAuth)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd NexLife
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase Database

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the content from `supabase/migrations/20260210171839_create_nexlife_schema.sql`
4. Paste and run the SQL to create all tables

### 5. Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add credentials to Supabase Dashboard → Authentication → Providers → Google

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
NexLife/
├── app/                      # Next.js app directory
│   ├── academics/           # Academics management page
│   ├── calendar/            # Calendar page
│   ├── dashboard/           # Main dashboard
│   ├── expenses/            # Expense tracking page
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── tasks/               # Task management page
│   ├── shopping/            # Shopping lists page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── layout/              # Layout components
│   └── ui/                  # UI components (Radix UI)
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities and configurations
│   ├── supabase/            # Supabase client and auth
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
└── supabase/                # Supabase migrations
    └── migrations/          # Database migrations
```

## 🗄️ Database Schema

The application uses the following main tables:

- **user_profiles** - User profile information
- **tasks** - Task management
- **expenses** - Financial transactions
- **calendar_events** - Calendar events
- **academics** - Academic resources
- **shopping_lists** - Shopping list containers
- **shopping_items** - Individual shopping items

All tables have Row Level Security (RLS) enabled for data protection.

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication required for all operations
- Secure session management with automatic token refresh
- Protected routes with authentication checks

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables on Vercel

Make sure to add these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Post-Deployment

After deployment, update your Supabase settings:

1. Add Vercel URL to Supabase → Authentication → URL Configuration
2. Update Google OAuth redirect URIs if using Google sign-in

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

## 📧 Contact

For any queries or support, please open an issue in the repository.

---

Made with ❤️ using Next.js and Supabase

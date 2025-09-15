# TalentFlow - Modern Hiring Platform

A complete hiring platform built with React and TypeScript. Manage jobs, track candidates, and create assessments - all with a beautiful, modern interface.

## ✨ What You Can Do

### 📋 **Job Management**
- Create and edit job postings with a clean interface
- Filter and search through all your jobs
- Drag & drop to reorder job listings
- Archive old positions when needed

### 👥 **Candidate Tracking** 
- View all candidates in a virtualized list (handles 1000+ candidates smoothly)
- Track candidates through hiring stages with a Kanban board
- Add notes and @mention team members
- See detailed candidate profiles with timeline history

### 📝 **Assessment Builder**
- Create custom assessments for each job
- 6 question types: multiple choice, text, numbers, file uploads, and more
- Live preview as you build
- Conditional logic (show questions based on previous answers)

## 🚀 Quick Start

```bash
# Get started in 3 steps
git clone [your-repo-url]
cd job-board
npm install

# Start the app
npm run dev
# Opens at http://localhost:5173
```

That's it! The app comes with sample data so you can start exploring immediately.

## 🛠️ How It Works

### **Frontend Only, Backend Feel**
This is a front-end only application, but it feels like it has a real backend:

- **Mock API**: Uses MSW (Mock Service Worker) to simulate a real API
- **Realistic Delays**: Includes network latency (200-1200ms) and occasional errors
- **Data Persistence**: Everything saves to your browser's local storage
- **Optimistic Updates**: UI updates instantly, then syncs with "server"

### **Built for Performance**
- **Virtual Scrolling**: Smoothly handles thousands of candidates
- **Smart Caching**: React Query keeps data fresh and fast
- **Optimistic Updates**: Changes appear instantly, rollback on errors
- **Code Splitting**: Only loads what you need

### **Modern Tech Stack**
```
Frontend:    React 18 + TypeScript + Vite
UI:          shadcn/ui + Tailwind CSS (beautiful, accessible components)
State:       Zustand + React Query (simple, powerful state management)
Database:    IndexedDB via Dexie.js (persistent browser storage)
API Mock:    MSW (realistic API simulation)
```

## 📁 Project Structure

```
src/
├── pages/           # Main app pages (Jobs, Candidates, Assessments)
├── components/
│   ├── features/    # Feature-specific components
│   │   ├── jobs/    # Job management components
│   │   ├── candidates/ # Candidate tracking components
│   │   └── assessments/ # Assessment builder components
│   ├── ui/          # Reusable UI components (buttons, cards, etc.)
│   └── layout/      # App layout and navigation
├── stores/          # State management (Zustand stores)
├── hooks/           # Custom React hooks and React Query
├── mocks/           # API simulation and fake data generation
└── lib/             # Utilities and configuration
```

## 🎯 Key Features Explained

### **Jobs Page**
- **Pagination**: Navigate through jobs 8 at a time
- **Filters**: Search by title, filter by status (active/archived), sort by different criteria
- **Drag & Drop**: Reorder jobs when sorted by "order"
- **Quick Actions**: Edit, archive, or view job details

### **Candidates Page**
- **Two Views**: List view (virtualized for performance) or Kanban board
- **Stages**: Applied → Screening → Technical → Offer → Hired/Rejected
- **Search & Filter**: Find candidates by name, email, or current stage
- **Notes**: Add notes with @mentions for team collaboration

### **Assessments Page**
- **Per-Job Assessments**: Each job can have its own custom assessment
- **Question Types**: 
  - Single/Multiple Choice
  - Short/Long Text
  - Numeric Input
  - File Upload
- **Live Preview**: See how your assessment looks as you build it
- **Conditional Logic**: Show/hide questions based on previous answers

## 🎨 Design Philosophy

### **Clean & Modern**
- Consistent design system using shadcn/ui components
- Proper spacing, typography, and color usage
- Dark/light mode support (coming soon)

### **User-Friendly**
- Clear navigation and breadcrumbs
- Loading states for everything
- Helpful error messages with retry options
- Responsive design that works on all devices

### **Performance First**
- Optimistic updates make everything feel instant
- Virtual scrolling for large lists
- Lazy loading and code splitting
- Efficient re-rendering with React.memo

## 🚀 Deployment

### **Development**
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

### **Production**
The app builds to static files and can be deployed anywhere:

- **Vercel**: `vercel deploy` (recommended)
- **Netlify**: Drag & drop the `dist` folder
- **Any Static Host**: Upload the `dist` folder

No server required! Everything runs in the browser.

## 🧪 Sample Data

The app comes with realistic sample data:
- **25 Jobs** across different departments and levels
- **1000+ Candidates** in various stages of the hiring process
- **Multiple Assessments** with different question types

All data is generated using Faker.js for realistic names, emails, and content.

## 📱 Browser Support

Works in all modern browsers that support:
- ES2020+ features
- IndexedDB for local storage
- CSS Grid and Flexbox
- Fetch API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**

*TalentFlow - Making hiring simple, efficient, and enjoyable.*
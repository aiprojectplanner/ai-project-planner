# Technology Stack 
 
 ## Frontend 
 - **Framework**: React 18 
 - **Build Tool**: Vite 
 - **Styling**: Tailwind CSS 
 - **Icons**: Lucide React 
 - **Gantt Library**: Custom lightweight Gantt implementation 
 
 ## State Management 
 - **Zustand**: Modular stores for authentication (`authStore.js`) and project data (`projectStore.js`). 
 
 ## Backend 
 - **Compute**: Vercel Serverless Functions (Node.js) 
 - **AI API**: OpenRouter (unified gateway; model IDs and priority list configured via `OPENROUTER_MODELS` / `OPENROUTER_MODEL` in environment variables) 
 
 ## Database & Auth (BaaS) 
 - **Platform**: Supabase 
 - **Database**: PostgreSQL 
 - **Authentication**: Supabase Auth (JWT based) 
 
 ## Hosting & Deployment 
 - **Frontend & API**: Vercel 
 - **Environment Management**: `.env.local` (local) / Vercel Environment Variables (production) 
 
 ## Version Control 
 - **Platform**: GitHub 
 - **Identity**: `aiprojectplanner` / `programplannerai@gmail.com` 

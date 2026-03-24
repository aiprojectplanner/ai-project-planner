# System Architecture 
 
 ## Overview 
 A modern project management SaaS built on a **Serverless + BaaS** architecture, prioritizing speed, modularity, and low operational overhead. 
 
 ## Frontend (React + Vite) 
 - **Single Page Application (SPA)**: Using React Router for navigation. 
 - **Component Driven**: Modular UI components styled with Tailwind CSS. 
 - **State Persistence**: Zustand manages global state, with session persistence for Auth and Projects. 
 
 ## Backend (Serverless) 
 - **API Layer**: Vercel Serverless Functions (located in `/api`) handle AI logic and secure data processing. 
 - **AI Gateway**: Communicates with OpenRouter to fetch structured JSON plans; the concrete model IDs and failover order come from environment variables (`OPENROUTER_MODELS` / `OPENROUTER_MODEL`). 
 
 ## Database Layer (Supabase) 
 - **Relational Storage**: PostgreSQL stores user-owned projects and tasks. 
 - **Security (RLS)**: Row Level Security ensures users can only access their own data. 
 - **Data Format**: Tasks are stored as a `JSONB` array within the `projects` table for schema flexibility. 
 
 ## Data Flow 
 
### 1. AI Generation Flow 
User Request (Prompt) → `/api/generate-plan` → OpenRouter (configured LLM(s), with optional per-model failover) → JSON Response → Frontend Store → Gantt Visualization. 
 
### 2. Data Persistence Flow 
User Edit (Editor) → Zustand Store (Local) → `supabase.from('projects').insert()` or `.update()` (by project id) → Supabase DB. 
 
 ### 3. Authentication Flow 
 Login/Sign-up → Supabase Auth → JWT Session → Zustand `authStore` → Route Protection. 

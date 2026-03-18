# Feature: User Authentication 
 
 ## Purpose 
 Allow users to securely register, login, and manage their session to access personalized project data. 
 
 ## User Flow 
 1. User visits `/auth` page. 
 2. User toggles between "Sign In" and "Sign Up" views on the same page. 
 3. User enters email and password. 
 4. On successful registration or login, the Zustand `authStore` is updated with the session. 
 5. `App.jsx` detects the user state and renders the Dashboard instead of the Auth page. 
 
 ## Inputs 
 - Email address 
 - Password 
 
 ## Processing Logic 
 - **Supabase Auth**: Uses `supabase.auth.signInWithPassword` or `signUp`. 
 - **Session Management**: Zustand `authStore.js` listens to `onAuthStateChange` to keep the UI in sync. 
 - **Validation**: Basic frontend validation for required fields and email format. 
 
 ## Database Tables 
 - `auth.users` (Internal Supabase table) 
 
 ## Expected Output 
 - JWT session token stored in browser via Supabase client. 
 - `user` object available in global state. 
 - Access to protected routes (Dashboard, Editor). 
 
 ## Error Cases 
 - **Invalid Credentials**: "Invalid login credentials" message. 
 - **Email Exists**: "User already registered" message. 
 - **Network Error**: Generic "Failed to connect to authentication service" message. 

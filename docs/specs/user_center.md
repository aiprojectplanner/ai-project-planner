# Feature: User Center 
 
**Status**: Planned feature — not currently accessible in UI. 
 
 ## Purpose 
 Provide users with a dedicated space to manage their profile, billing status, security settings, and platform usage. 
 
 ## User Flow 
 1. (Planned) User clicks on their profile avatar/name in the sidebar. 
 2. (Planned) System navigates to **User Center**. 
 3. (Planned) User can switch between tabs: **Profile**, **Billing**, **Security**, and **Usage**. 
 
 ## Inputs 
 - **Profile**: Display Name, Avatar (Optional). 
 - **Security**: Password change (Future). 
 
 ## Processing Logic 
 - **Profile**: Display current session email from `authStore`. 
 - **Usage**: (Mocked for MVP) Displays project count against the 3-project limit. 
 - **Billing**: (Mocked for MVP) Shows "Free Plan" status. 
 
 ## Database Tables 
 - `auth.users` (Read session data). 
 - `projects` (Count projects for Usage tab). 
 
 ## Expected Output 
 - Tabbed interface showing user-specific information. 
 - Visual indicator of "Pro" vs "Free" account status. 
 
 ## Error Cases 
 - **Unauthorized**: Redirect back to Login if session expires. 
 - **Data Fetch Failure**: Error message if project count fails to load. 

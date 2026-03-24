# Feature: Dashboard View 
 
 ## Purpose 
 Provide a central hub for users to view their project portfolio and initiate new planning sessions. 
 
 ## User Flow 
 1. User logs in. 
 2. Dashboard fetches all projects owned by the user. 
 3. User sees project cards with titles and last updated dates. 
4. User can rename a project directly from the project card. 
 
 ## Inputs 
 - Current User ID (from Auth session) 
 
 ## Processing Logic 
- Fetch from `projects` table ordered by `created_at` DESC. 
 - Filter results based on Supabase RLS. 
- Rename updates the corresponding `projects.title` row by `id` and refreshes local card state. 
 
 ## Database Tables 
 - `projects` 
 
 ## Expected Output 
 - A list or grid of project cards. 
 - Loading skeletons during fetch. 
- Successful inline rename updates card title without leaving Dashboard. 
 
 ## Error Cases 
 - Failed to fetch data. 
 - Session expired. 
- Rename failure (database/network) should not navigate away and should surface an error message. 

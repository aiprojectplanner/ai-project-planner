# Database Schema 
 
 ## Tables 
 
 ### projects 
 - `id`: UUID (Primary Key) 
 - `user_id`: UUID (Foreign Key to auth.users) 
 - `title`: Text 
 - `tasks`: JSONB 
 - `created_at`: Timestamp 
 - `updated_at`: Timestamp 
 
 ## RLS Policies 
 - **Manage own projects**: Users can only read, insert, update, and delete their own projects where `auth.uid() = user_id`. 

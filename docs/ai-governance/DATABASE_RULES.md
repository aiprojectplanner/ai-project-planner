# Database Rules 
 
 ## Migration First 
 
 Database changes must be done via migrations rather than manual schema edits. 
 
 ## Avoid Destructive Operations 
 
 AI should never automatically: 
 
 - drop tables 
 - delete large datasets 
 - remove RLS policies 
 
 without explicit confirmation. 
 
 ## Supabase Debugging Order 
 
 When database issues occur check in this order: 
 
 1. Query syntax 
 2. Table schema 
 3. Column types 
 4. RLS policies 
 5. Environment variables 
 6. Migration status 
 
 ## Always Verify Query Result 
 
 Before assuming a bug in frontend logic confirm the database response. 

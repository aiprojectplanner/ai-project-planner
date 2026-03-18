# Bug Analysis Template 
 
 ## Bug Title 
 *Short descriptive title of the issue.* 
 
 ## Bug Description 
 *Detailed explanation of what is going wrong.* 
 
 ## Reproduction Steps 
 1. 
 2. 
 3. 
 
 ## Expected Behavior 
 *What should happen?* 
 
 ## Actual Behavior 
 *What is actually happening?* 
 
 ## Suspected Layer 
 - [ ] Frontend (React/Zustand) 
 - [ ] API (Vercel Serverless) 
 - [ ] Backend Logic (AI Generation) 
 - [ ] Database (Supabase/PostgreSQL) 
 - [ ] Auth / RLS Policies 
 - [ ] Environment Configuration 
 - [ ] System Architecture 
 
 ## Evidence Collected 
 - **Console**: *Error logs from browser.* 
 - **Network**: *Failed requests or incorrect payloads.* 
 - **Logs**: *Terminal output or console.log statements.* 
 - **DB Results**: *Raw data from Supabase.* 
 - **Observations**: *Visual UI behavior.* 
 
 ## Affected Files 
 List files likely involved in the bug. 
 
 Example: 
 - src/components/GanttChart.tsx 
 - src/store/projectStore.ts 
 - src/api/generate-plan.ts 
 - supabase queries or migrations 
 
 ## Root Cause Hypotheses 
 1. 
 2. 
 3. 
 
 ## Attempts Made 
 1. 
 2. 
 3. 
 
 ## Why Previous Attempts Failed 
 *Analysis of why the patches didn't solve the core problem.* 
 
 ## Most Likely Root Cause 
 *The confirmed or most probable reason for the bug.* 
 
 ## Smallest Safe Fix 
 *The minimal code change required.* 
 
 ## Risks of the Fix 
 *Potential side effects or regressions.* 
 
 ## Need User Approval? 
 - **Yes / No** 
 - **Why**: *Explain if it touches sensitive data, billing, or core architecture.* 

# Bug Root Cause Workflow 
 
 ## 1. Goal 
 The goal of this workflow is to prevent "patching loops" (random code modifications without understanding) and force evidence-based debugging. This ensures that every fix addresses the actual root cause rather than just suppressing symptoms. 
 
 ## 2. Debugging Mode Trigger 
 AI must stop coding and enter "Debugging Mode" when: 
 - The same bug is attempted more than 3 times without success. 
 - A fix causes a regression in previously working functionality. 
 - The root cause is uncertain or spans multiple system layers (e.g., Frontend to Database). 
 - The user reports that a previous fix did not work. 
 
 ## 3. Required Investigation Order 
 Investigation must follow this strict sequence: 
 
 0. **Verify Current Deployment & Reproducibility**: Confirm the bug still exists in the latest deployed version. 
    - Confirm Vercel deployment is updated. 
    - Refresh browser cache. 
    - Ensure the issue is reproducible. 
 
 0.1 **Check Bug History**: Review `docs/ai-governance/BUG_HISTORY.md` for similar symptoms, confirmed root causes, and past fixes. 
 
 1. **Reproduce**: Clearly define the steps to trigger the bug. 
 2. **Symptoms**: Record exact error messages, visual glitches, or data inconsistencies. 
 3. **Browser Console**: Check for JavaScript errors, warnings, or failed resource loads. 
 4. **Network**: Inspect request payloads and response bodies (especially for `/api` and Supabase). 
 5. **Frontend State**: Use logs to verify Zustand store values and component props. 
 6. **Backend/API**: Check Vercel logs or local terminal output for Serverless Function errors. 
 7. **Database Query**: Verify the raw response from Supabase/PostgreSQL. 
 8. **Schema/Migrations**: Confirm the table structure matches the code expectations. 
 9. **RLS/Auth**: Check if Row Level Security policies or session expiration are causing failures. 
 10. **Environment/Config**: Validate `.env.local` variables and Vite/Vercel settings. 
 11. **Identify Root Cause**: State the specific line of code or configuration at fault. 
 12. **Smallest Safe Fix**: Propose the minimal change required to solve the issue. 
 
 ## 4. Patch Loop Prevention 
 - **After 3 attempts**: Stop and summarize all collected evidence. 
 - **After 5 attempts**: Halt all code changes. Re-evaluate the root cause hypothesis from scratch. 
 - **After 10 attempts**: Assume a fundamental architecture or design flaw. Propose a redesign instead of a patch. 
 
 ## 5. Evidence Rule 
 No fix should be proposed without referencing at least one piece of hard evidence: 
 - A specific console error stack trace. 
 - A specific network response code or JSON body. 
 - A database query result that contradicts expectations. 
 - A log output showing incorrect state transitions. 
 
 ## 6. Safe Fix Rule 
 - Avoid large-scale refactors during a bug fix unless the architecture is proven to be the cause. 
 - Never perform destructive database actions (Drop, Delete All) without explicit founder approval. 
 
 ## 7. Output Requirement 
 Before applying a fix, the AI must output a "Bug Analysis Summary": 
 - **Description**: What is happening? 
 - **Suspected Layer**: Where is it happening? 
 - **Hypothesis**: Why is it happening? 
 - **Evidence**: How do we know? 
 - **Proposed Fix**: What will be changed? 

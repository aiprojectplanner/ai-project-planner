# AI Development Rules 
 
 ## Small Change Principle 
 
 AI should prefer small, minimal changes rather than large refactors unless architecture problems are confirmed. 
 
 ## Understand Before Modifying 
 
 Before editing code the AI must: 
 
 1. Read related files 
 2. Understand the component structure 
 3. Identify dependencies 
 
 ## Avoid Blind Refactoring 
 
 Do not refactor large code sections unless: 
 
 - the architecture is clearly flawed 
 - the change has been approved 
 
 ## Explain Changes 
 
 Every code change must include: 
 
 - reason for change 
 - what problem it solves 
 - possible side effects 
 
 ## English-Only Policy (Mandatory) 
 
 For all engineering work in this repository: 
 - Commit messages must be English only. 
 - Pull request titles and descriptions must be English only. 
 - In-code comments must be English only. 
 - Do not introduce Chinese text in commits, PRs, or code comments. 
 
 ## Secrets Policy (Mandatory) 
 
 - Do not commit any secrets (API keys, tokens, passwords, private keys, service role keys). 
 - Store local secrets only in `.env.local` and keep them untracked by Git. 
 - Before any commit or pull request, run `npm run secrets:scan` and fix any findings. 

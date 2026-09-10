---------------------------------------Full-Stack Engineering, CI/CD & Deployment Reference Manual----------------------------------------------------------

                                          ----------------------------------------------------------
                                                      1. Git & Version Control Management
                                          ----------------------------------------------------------
The Purpose of Branching
In professional software development, the primary branch (such as main) represents stable, production-tested software. Developers must never work directly on this primary branch. Instead, they isolate their work using dedicated feature branches. This prevents half-finished or broken code from affecting other teammates or live users.

The Lifecycle of a Feature & Essential Commands
Update Local Main: Always make sure your local copy of main is up to date before starting new work.
bash
git checkout main
git pull origin main
Branch Creation: Create and switch to a dedicated feature branch with a descriptive name.
bash
git checkout -b feature/user-authentication
Atomic Commits: Stage your changes and commit them with a clear, descriptive message explaining why the change was made.
bash
git status
git add .
git commit -m "feat(auth): add JWT login endpoint and password hashing"
Pushing Feature Branch: Push your new branch to GitHub so you can open a Pull Request.
bash
git push -u origin feature/user-authentication
Pull Request (PR) & Merging: Open a Pull Request on GitHub from feature/user-authentication into main. Once peer review is approved and all automated CI checks pass, merge the PR into main using the GitHub interface (preferably via "Squash and Merge").

                                          ----------------------------------------------------------
                                                      2. GitHub Actions Workflow Fundamentals
                                          ----------------------------------------------------------


How GitHub Actions Operates
GitHub Actions is an event-driven automation platform built directly into GitHub repositories. It listens for specific Git events—such as pushing code, opening a pull request, or creating a release tag—and automatically spins up isolated virtual machines in the cloud (called runners) to execute defined tasks.

Core Concepts
Workflow Directory: All workflow configuration files must be stored in the root of the project inside the .github/workflows/ directory as .yml files.
Triggers: Events that start a workflow (e.g., pushes to main or deployment-ready).
Jobs & Steps: Workflows contain jobs (which run on separate virtual machines) and jobs contain ordered steps (shell commands or pre-built actions).
Secrets Management: Sensitive values like database credentials and JWT tokens are stored in the GitHub repository under Settings ➔ Secrets and variables ➔ Actions.
Generating Secure Production Secrets
To generate a cryptographically secure 64-byte random hex key for your PROD_JWT_SECRET_KEY secret:

bash
python -c "import secrets; print(secrets.token_hex(64))"

                                          ----------------------------------------------------------
                                                      3. CI/CD Pipeline Automation
                                          ----------------------------------------------------------
                                          
Continuous Integration (CI)
Continuous Integration automatically integrates and validates code changes from all team members. The CI pipeline acts as a quality gatekeeper before code can be merged or deployed.

Typical Commands Executed by the CI Runner
The virtual runner automatically executes these commands during the validation phase:

Backend Code Quality & Testing:

bash
# Install dependencies
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
# Run backend automated unit & integration test suite
pytest backend/tests
Frontend Code Quality & Testing:

bash
# Clean install of frontend dependencies
npm ci --prefix frontend
# Run linter
npm run lint --prefix frontend
# Run frontend test suite
npm test --prefix frontend
# Verify the production build compiles without errors
npm run build --prefix frontend
If any of these commands exit with a non-zero error code, the pipeline fails immediately and deployment is completely blocked.

                                          ----------------------------------------------------------
                                                      4. Selenium UI and End-to-End Testing
                                          ----------------------------------------------------------


The Role of UI Testing
Unit tests verify isolated functions, and integration tests verify API endpoints. End-to-End (E2E) tests simulate a real human interacting with the system through a web browser to ensure the frontend and backend interact seamlessly.

Running Headless Browser Tests in CI
Because cloud CI servers do not have a physical monitor or graphical desktop, the browser must be executed in headless mode (running in background memory).

Installing Testing Dependencies:

bash
pip install selenium webdriver-manager pytest
Executing the UI Test Suite:

bash
pytest tests/e2e/
Dynamic Waiting Strategies
Rather than using static delays that waste time or cause flaky tests when network speeds fluctuate, always use condition-based explicit waits. In test code, tell the driver to wait dynamically until elements are visible or clickable before interacting with them.

                                          --------------------------------------------------------------------------
                                                   5. Deployment Architecture(Backend, Frontend, Database)
                                          --------------------------------------------------------------------------


Decoupled 3-Tier Architecture
Modern applications separate concerns across three specialized cloud tiers:

Frontend Tier (e.g., Vercel, Netlify):

Hosts static assets and server-rendered pages.
Built and served using:
bash
npm run build
Configured with environment variable pointing to the cloud backend: NEXT_PUBLIC_API_URL=https://your-backend.railway.app.
Backend Tier (e.g., Railway, Render):

Runs the application server process and handles business logic and APIs.
Startup command that dynamically binds to the cloud provider's allocated port:
bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
Database Tier (e.g., Neon Serverless PostgreSQL):

Managed cloud database requiring encrypted SSL connections.
Connection string format:
postgresql://username:password@ep-host.region.aws.neon.tech/dbname?sslmode=require

                                          ----------------------------------------------------------
                                               6. Issues Faced During Cloud Deployment & Fixes  
                                          ----------------------------------------------------------


1. Cross-Origin Resource Sharing (CORS) Blockages
Symptom: Browser console displays No 'Access-Control-Allow-Origin' header is present on the requested resource.
Cause: The browser prevents a frontend on one domain from fetching data from a backend on another domain.
Fix: In your backend application setup, add the production frontend URL to your allowed origins list.
2. Port Binding Failures
Symptom: Deployment log displays Service timed out on port binding or crashes immediately.
Cause: Hard-coding a port (like 8000) instead of reading the dynamic $PORT assigned by the hosting environment.
Fix: Always bind to host 0.0.0.0 and read the port dynamically:
bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
3. Local Port Conflicts
Symptom: [Errno 10048] error while attempting to bind on address: address already in use.
Finding and killing the stuck process locally (Windows):
powershell
# Find which process ID (PID) is using port 8000
netstat -ano | findstr :8000
# Terminate that process using its PID
taskkill /PID <PID_NUMBER> /F
4. Database SSL Requirement Errors
Symptom: Cloud database rejects connection with SSL handshake errors.
Fix: Ensure your production DATABASE_URL environment variable includes ?sslmode=require at the end.

                                          ----------------------------------------------------------
                                            7. Automated CI/CD Pipeline to Deployment on Git Push 
                                          ----------------------------------------------------------


The Continuous Deployment Workflow
Whenever a developer finishes reviewing code and pushes to the release branch, the deployment executes automatically:

Push to Deployment Branch:
bash
git checkout deployment-ready
git merge main
git push origin deployment-ready
Pipeline Execution: GitHub Actions detects the push to deployment-ready.
Automated Testing: The runner executes backend and frontend tests.
Automated Production Release: If and only if all tests pass, the pipeline runs database migrations and updates the cloud deployment.

                        ----------------------------------------------------------------------------------------
                                     8. Automated Schema Migrations via CI/CD (The GitOps Pattern)
                        -----------------------------------------------------------------------------------------


The Core Principle
"Schema changes must be reflected through production deployment rather than executing migration commands from a developer's local machine against the production database."

Why Local Execution Against Production is Prohibited:
Security: Developers never need the production database password on their personal machines.
Safety: Changes are validated through automated tests before touching production.
Auditability: Every schema change corresponds directly to a committed migration file in Git history.
The Complete Step-by-Step Migration Cycle:
Step A: Modify Model in Code (Local)
Edit your database model class (e.g., adding barcode column in product.py).

Step B: Autogenerate the Migration Script (Local)
In your local terminal, let Alembic detect the change and create a version-controlled migration file:

powershell
cd backend
alembic revision --autogenerate -m "add barcode to products"
(This generates a new .py file inside backend/alembic/versions/)

Step C: Test the Migration on Your Local Database
Verify that the migration applies cleanly to your local database without syntax errors:

powershell
alembic upgrade head
(If you ever need to rollback locally for testing:)

powershell
alembic downgrade -1
Step D: Commit and Push the Migration File to Git
Stage both the modified model and the newly created migration file:

powershell
cd ..
git add .
git commit -m "feat(schema): add barcode column to products table"
git push origin deployment-ready
Step E: Automated Application in Production (GitHub Actions Runner)
GitHub Actions automatically executes the upgrade against the production database using the stored repository secret:

bash
alembic upgrade head
(With DATABASE_URL set to ${{ secrets.PROD_DATABASE_URL }})

Checking Migration Status
To see which revision is currently applied to the database:

bash
alembic current

                        -----------------------------------------------------------------------------------------
                                  9. Top Pitfalls Faced by Beginners from Development to Production
                        -----------------------------------------------------------------------------------------


1. Accidental Exposure of Secrets
Never push .env files to GitHub.
Ensure your .gitignore includes:
text
.env
.env.local
*.pyc
__pycache__/
node_modules/
.venv/
2. Missing Migration Files
Modifying a model file in code does not change the database. You must always run alembic revision --autogenerate locally to create the migration file and commit it.
3. Database Engine Differences
Avoid using SQLite locally and PostgreSQL in production. Syntax, data types (e.g., DateTime with timezone, JSON fields), and constraints behave differently. Use local PostgreSQL for development.
4. Adding Non-Nullable Columns to Existing Populated Tables
Adding a nullable=False column without a default value to a table with existing rows will crash the migration because the existing rows will contain NULL.
Solution: Always make new columns nullable=True, or provide a default value.
5. Hardcoding Local URLs in Frontend Code
Never write http://localhost:8000 in frontend fetch calls. Always use an environment variable (e.g., process.env.NEXT_PUBLIC_API_URL).
6. Forgotten Dependencies
If you install a library locally, you must record it in your dependencies file before committing, otherwise the cloud build will fail.
bash
# Python: freeze dependencies
pip freeze > requirements.txt
# Node.js: install and save to package.json
npm install <package-name> --save

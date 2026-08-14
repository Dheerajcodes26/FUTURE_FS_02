# FUTURE_FS_02 — CLIENT LEAD MANAGEMENT SYSTEM (MINI CRM)
# AI CODING AGENT — STEP-BY-STEP TASK FILE

IMPORTANT:
This file contains the complete implementation roadmap for Future Interns Full Stack Web Development Internship — Task 2.

The AI coding agent MUST NOT execute tasks automatically.

The agent must:
1. Read this file.
2. Understand the complete project goal.
3. Wait for the user to explicitly request a task.
4. Execute ONLY the requested task.
5. Stop after completing that task.
6. Never automatically continue to the next task.
7. Never perform unrelated improvements.

The user will issue commands such as:

EXECUTE TASK 1
EXECUTE TASK 2
EXECUTE TASK 3

etc.

If a task is already completed, inspect it briefly and report that it is complete instead of rebuilding it.

============================================================
PROJECT GOAL
============================================================

Build a professional, functional Client Lead Management System (Mini CRM).

The system should allow a business owner/admin to:

- Securely log in.
- View incoming leads.
- Add leads.
- View lead details.
- Update lead status.
- Add follow-up notes.
- Delete leads.
- Search and filter leads.
- View basic lead analytics.
- Receive leads from a website contact form.
- Store all lead information in MongoDB.

Real-world workflow:

Website Contact Form
        ↓
Backend API
        ↓
MongoDB
        ↓
CRM Dashboard
        ↓
Admin Login
        ↓
View Lead
        ↓
Follow-up Notes
        ↓
Status: New → Contacted → Converted

============================================================
RECOMMENDED STACK
============================================================

Frontend:
- React
- Vite
- JavaScript
- CSS
- Axios

Backend:
- Node.js
- Express.js

Database:
- MongoDB Atlas
- Mongoose

Authentication:
- JWT
- bcrypt

Development:
- VS Code
- Git
- GitHub

Do not introduce unnecessary frameworks or libraries.

============================================================
CREDIT OPTIMIZATION RULES
============================================================

The AI coding agent has a limited credit budget.

For every task:

- Read only files relevant to that task.
- Do not repeatedly inspect the entire repository.
- Do not rewrite working code unnecessarily.
- Do not regenerate complete files when a targeted edit is enough.
- Do not add features that are not requested.
- Do not redesign unrelated sections.
- Do not install unnecessary dependencies.
- Do not automatically fix unrelated warnings.
- Do not automatically execute future tasks.
- Do not refactor unrelated code.
- Keep implementation simple and production-oriented.
- Prefer small, deterministic changes.
- Reuse existing components and utilities when appropriate.
- After completing the task, verify the relevant functionality.
- Report changes briefly.
- STOP.

============================================================
PERMANENT PROJECT RULES
============================================================

1. Build real working functionality, not mock-only screens.
2. Frontend and backend must be clearly separated.
3. Use REST APIs.
4. Use MongoDB for persistent lead storage.
5. Protect admin CRM routes with authentication.
6. Never hard-code secrets.
7. Never commit `.env`.
8. Use `.env.example`.
9. Hash passwords with bcrypt.
10. Use JWT authentication.
11. Validate user input.
12. Handle API errors properly.
13. Provide loading, error, success, and empty states.
14. Keep the UI responsive.
15. Keep the design professional and clean.
16. Do not over-engineer the application.
17. Do not add advanced features unless explicitly requested.
18. Do not break previously completed functionality.
19. Do not modify completed tasks unless necessary for the current task.
20. Stop after every requested task.

============================================================
TARGET PROJECT STRUCTURE
============================================================

Use a structure similar to:

FUTURE_FS_02/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .env.example
├── .gitignore
├── README.md
└── package.json

Do not create unnecessary folders. Create them only when needed.

============================================================
DATABASE MODEL
============================================================

Lead:

- name: required
- email: required
- phone: optional
- source: required
- status: new | contacted | converted
- notes: array of follow-up notes
- createdAt
- updatedAt

Each note should contain:
- text
- createdAt

Admin:

- email
- passwordHash
- createdAt

Never store plaintext passwords.

============================================================
API TARGET
============================================================

Authentication:

POST /api/auth/login

Leads:

GET    /api/leads
GET    /api/leads/:id
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/:id/notes

The exact implementation may vary if a better structure is required, but do not add unnecessary endpoints.

============================================================
TASK 1 — PROJECT FOUNDATION
============================================================

Create the basic full-stack project foundation.

Requirements:

- Create React + Vite frontend.
- Create Node.js + Express backend.
- Separate client and server.
- Configure basic Express server.
- Configure frontend development environment.
- Configure CORS where required.
- Create `.gitignore`.
- Create `.env.example`.
- Add sensible package scripts.

Do NOT implement:
- MongoDB CRUD
- Authentication
- Dashboard
- Analytics
- Advanced UI

Verify:
- Frontend starts successfully.
- Backend starts successfully.

STOP after Task 1.

============================================================
TASK 2 — MONGODB DATABASE & LEAD MODEL
============================================================

Implement the database layer.

Requirements:

- Connect backend to MongoDB Atlas using Mongoose.
- Use environment variables for the connection string.
- Create Lead model.
- Add:
  - name
  - email
  - phone
  - source
  - status
  - notes
  - timestamps
- Validate required fields.
- Restrict status to:
  - new
  - contacted
  - converted
- Store note text and timestamps.

Add proper database connection/error handling.

Do NOT build frontend dashboard yet.

Verify the backend can connect to MongoDB.

STOP after Task 2.

============================================================
TASK 3 — LEAD CRUD REST API
============================================================

Implement the Lead REST API.

Create:

POST /api/leads
GET /api/leads
GET /api/leads/:id
PUT /api/leads/:id
DELETE /api/leads/:id

Requirements:

- Create lead.
- List leads.
- Get individual lead.
- Update lead.
- Delete lead.
- Validate incoming data.
- Return appropriate HTTP status codes.
- Handle invalid IDs.
- Handle missing leads.
- Handle database errors.

The API must store real data in MongoDB.

Do not build the CRM UI yet.

Verify the endpoints work.

STOP after Task 3.

============================================================
TASK 4 — ADMIN AUTHENTICATION
============================================================

Implement secure admin authentication.

Requirements:

- Create Admin model.
- Hash passwords with bcrypt.
- Implement admin login.
- Create JWT authentication.
- Create authentication middleware.
- Protect CRM lead-management routes.
- Use environment variable for JWT secret.
- Never expose password hashes.
- Return clear authentication errors.

Do not implement complex roles or permissions.

The system only needs a secure admin role for this internship task.

Verify:
- Valid credentials can log in.
- Invalid credentials are rejected.
- Protected routes reject unauthenticated requests.

STOP after Task 4.

============================================================
TASK 5 — REACT LOGIN PAGE
============================================================

Build the frontend admin login page.

Requirements:

- Professional login UI.
- Email field.
- Password field.
- Login button.
- Validation.
- Loading state.
- Error state.
- Successful login handling.
- Store authentication state securely enough for the application architecture.
- Redirect authenticated users to dashboard.
- Prevent unauthenticated users from accessing dashboard.

Keep the UI clean and responsive.

Do not build advanced dashboard features yet.

STOP after Task 5.

============================================================
TASK 6 — CRM DASHBOARD & LEAD LIST
============================================================

Build the main CRM dashboard.

Required UI:

- Sidebar/header/navigation.
- Admin identity/logout.
- Dashboard heading.
- Lead list/table.
- Lead count.
- Lead name.
- Email.
- Source.
- Status.
- Created date.

Connect the React frontend to the backend API.

Requirements:

- Fetch real leads from MongoDB through the API.
- Display loading state.
- Display error state.
- Display empty state.
- Provide logout.
- Protect dashboard access.

Do not implement analytics, advanced search, or notes yet.

STOP after Task 6.

============================================================
TASK 7 — LEAD DETAILS, STATUS & FOLLOW-UP NOTES
============================================================

Implement lead management functionality.

Requirements:

- Open/view lead details.
- Display all lead information.
- Change status:
  - New
  - Contacted
  - Converted
- Save status changes.
- Add follow-up notes.
- Display previous notes.
- Show note timestamps.
- Delete lead.
- Confirm destructive deletion.
- Refresh/update dashboard data after changes.

Add backend endpoint for notes if needed:

POST /api/leads/:id/notes

Use real API/database operations.

Do not add unrelated features.

STOP after Task 7.

============================================================
TASK 8 — SEARCH, FILTER & BASIC ANALYTICS
============================================================

Implement the high-value optional features.

Search:
- Search by lead name.
- Search by email.

Filter:
- All.
- New.
- Contacted.
- Converted.

Analytics cards:

- Total Leads.
- New Leads.
- Contacted Leads.
- Converted Leads.
- Conversion Rate.

Keep analytics simple.

Do NOT install a large charting library unless genuinely necessary.

Make sure filtering and counts reflect actual lead data.

STOP after Task 8.

============================================================
TASK 9 — RESPONSIVE UI & UX POLISH
============================================================

Improve the CRM UI for:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

Requirements:

- No horizontal overflow.
- Responsive navigation.
- Responsive lead list.
- Mobile-friendly lead details.
- Responsive forms.
- Clear buttons.
- Good spacing.
- Readable typography.
- Accessible focus states.
- Loading indicators.
- Error messages.
- Success feedback.
- Empty states.

Keep the existing visual identity.

Do not perform a complete redesign.

Do not add complex animations.

STOP after Task 9.

============================================================
TASK 10 — SECURITY, VALIDATION & ERROR HANDLING REVIEW
============================================================

Perform a focused security and reliability review.

Check:

- Password hashing.
- JWT validation.
- Protected routes.
- Environment variables.
- `.gitignore`.
- `.env.example`.
- Input validation.
- Sensitive information exposure.
- MongoDB query safety.
- CORS.
- Authentication errors.
- API errors.
- Invalid IDs.
- Missing records.
- Unauthorized access.

Fix only actual issues found.

Do not perform unrelated refactoring.

STOP after Task 10.

============================================================
TASK 11 — TASK 1 PORTFOLIO CONTACT FORM INTEGRATION
============================================================

Connect the Task 1 portfolio contact form to this CRM backend.

The portfolio contact form should create a new lead through:

POST /api/leads

Map:

Name → name
Email → email
Message → notes
Source → Website
Status → new

Requirements:

- Keep the existing Task 1 portfolio design unchanged.
- Send form data to the CRM backend.
- Validate input.
- Show loading state.
- Show success state.
- Show error state.
- Handle network errors.
- Configure CORS safely.
- Do not expose MongoDB credentials to the frontend.

If modifying the Task 1 portfolio is required, make only the smallest integration changes.

Do not redesign Task 1.

STOP after Task 11.

============================================================
TASK 12 — FINAL TESTING & PRODUCTION CHECK
============================================================

Perform a final end-to-end verification.

Test the complete workflow:

1. Visitor submits portfolio contact form.
2. Backend receives lead.
3. Lead is stored in MongoDB.
4. Status is `new`.
5. Admin logs in.
6. Admin sees lead.
7. Admin opens lead details.
8. Admin adds follow-up note.
9. Admin changes status to `contacted`.
10. Admin can change status to `converted`.
11. Dashboard counts update.
12. Search works.
13. Filters work.
14. Delete works.
15. Logout works.
16. Protected dashboard cannot be accessed without authentication.

Also verify:

- Frontend build.
- Backend startup.
- Environment configuration.
- Responsive layout.
- Error handling.

Fix only issues that prevent the required workflow from working.

Do not add new features.

STOP after Task 12.

============================================================
TASK 13 — README & DOCUMENTATION
============================================================

Create/update a professional README.

Include:

- Project title.
- Internship/task information.
- Project overview.
- Problem statement.
- Objectives.
- Features.
- Tech stack.
- Architecture.
- Folder structure.
- Database structure.
- Authentication.
- API endpoints.
- Setup instructions.
- Environment variables.
- Local development.
- Deployment instructions.
- Screenshots section.
- Live demo placeholder.
- GitHub repository.
- Future improvements.
- Developer information.

Explain the real-world workflow:

Portfolio Contact Form
→ Express API
→ MongoDB
→ Admin CRM
→ Lead Status
→ Follow-up
→ Conversion

Do not claim features that are not actually implemented.

STOP after Task 13.

============================================================
TASK 14 — FINAL CLEANUP
============================================================

Perform a conservative final cleanup.

Check for:

- Unused imports.
- Unused files.
- Obvious dead code.
- Duplicate simple styles.
- Console logs that should not remain.
- Exposed secrets.
- Missing `.env.example`.
- Missing `.gitignore`.
- Broken links.
- Broken API URLs.
- Build errors.

Only remove/fix things that are clearly unnecessary or broken.

Do not redesign.
Do not introduce new features.
Do not change working architecture without a strong reason.

Verify the application still works.

STOP after Task 14.

============================================================
TASK PRIORITY
============================================================

If time or credits become limited, complete tasks in this order:

MUST COMPLETE:
1
2
3
4
5
6
7
9
10
12
13

HIGH VALUE:
8
11

LOW PRIORITY:
14

Do not sacrifice:
- Backend
- Database
- Authentication
- CRUD
- Dashboard
- Status management
- Notes
- Security

for visual extras.

============================================================
EXPECTED FINAL PRODUCT
============================================================

The final CRM should allow a real business owner to:

1. Receive leads from a website.
2. Store them in MongoDB.
3. Securely log into an admin panel.
4. View all leads.
5. Search leads.
6. Filter leads.
7. Open lead details.
8. Update lead status.
9. Add follow-up notes.
10. Track conversion.
11. Delete leads.
12. View basic lead statistics.

The finished application should feel like a small real-world business tool rather than a static college/demo project.

============================================================
FINAL AGENT RULE
============================================================

NEVER execute multiple tasks from this file in one command.

If the user says:

EXECUTE TASK 3

execute ONLY Task 3.

Do not execute Task 4 afterward.

If the user says:

EXECUTE TASK 7

execute ONLY Task 7.

Do not execute Task 8 afterward.

After every task:

- Verify.
- Summarize.
- STOP.
- Wait for the user's next explicit command.

============================================================
END OF MASTER TASK FILE
============================================================

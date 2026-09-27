# 🚀 Taskforge

> **A modern workspace for managing projects, tasks, teams, and progress — all in one place.**

Taskforge is a modern **project and task management web application** designed to help teams organize projects, track work, manage members, and monitor progress through a centralized dashboard.

---

## 🌟 Overview

Taskforge provides a clean and structured workspace for managing day-to-day project activities.

Users can:

* 📁 Create and manage projects
* 👥 Add and manage team members
* ✅ Create and assign tasks
* 🎯 Set task priorities and statuses
* 📅 Manage start dates and due dates
* 📊 Monitor project and task progress
* 🔔 Track important notifications
* 🔎 Search, filter, and sort tasks
* 🛡️ Manage users through administrator controls

---

## ✨ Main Capabilities

### 🔐 Authentication

* User registration
* Secure sign-in
* Email and password authentication
* Session management
* Email confirmation support

### 📁 Project Management

* Create and edit projects
* Project descriptions
* Project status tracking
* Priority management
* Start and due dates
* Project ownership
* Team member management
* Project archiving
* Project deletion

### ✅ Task Management

* Create, edit, and delete tasks
* Assign tasks to team members
* Task status management
* Priority management
* Due-date tracking
* Automatic overdue task detection
* Search and filtering
* Task sorting

### 📊 Dashboard

The dashboard provides a centralized overview of:

* Active projects
* Pending tasks
* Completed tasks
* Overdue tasks
* High-priority tasks
* Total tasks
* Overall completion progress
* Project-level progress

### 🔔 Notifications

The notification system supports:

* Read/unread notification state
* Notification timestamps
* Optional navigation links
* Mark individual notifications as read
* Mark all notifications as read

### 👨‍💼 Administration

Administrators can:

* View registered users
* Identify administrator accounts
* Access the user management area

Regular users do not have access to the administrative user list.

---

# 🛠️ Technology Stack

| Technology         | Purpose                    |
| ------------------ | -------------------------- |
| ⚛️ React 19        | Frontend UI                |
| 🔷 TypeScript      | Type-safe development      |
| 🚀 TanStack Start  | Application framework      |
| 🧭 TanStack Router | Application routing        |
| ⚡ Vite             | Build tool                 |
| 🗃️ Redux Toolkit  | State management           |
| ☁️ Supabase        | Backend and authentication |
| 🗄️ PostgreSQL     | Database                   |
| 🧬 Drizzle         | Database migration tooling |
| 📝 React Hook Form | Form handling              |
| 🔍 Zod             | Data validation            |
| 🎨 Tailwind CSS    | Styling                    |
| 🧩 Radix UI        | Accessible UI components   |
| ✨ Lucide React     | Icons                      |
| 📈 Recharts        | Data visualization         |
| 📦 Bun / npm       | Package management         |

---

# 📂 Project Structure

```text
code-genie-main/
│
├── 📁 public/
│   └── Static assets
│
├── 📁 src/
│   ├── 📁 components/       # Reusable UI components
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 integrations/     # Supabase integration
│   ├── 📁 lib/              # Utilities, types and validation
│   ├── 📁 routes/           # Application routes
│   ├── 📁 store/            # Redux store and state
│   ├── 📄 styles.css        # Global styles
│   ├── 📄 router.tsx        # Router configuration
│   ├── 📄 server.ts         # Server entry
│   └── 📄 start.ts          # Application entry
│
├── 📁 drizzle/
│   └── 📁 migrations/       # Database migrations
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 README.md
```

---

# 🧭 Application Routes

| Route               | Description                        |
| ------------------- | ---------------------------------- |
| 🏠 `/`              | Application landing page           |
| 🔐 `/auth`          | Sign in and registration           |
| 📊 `/dashboard`     | Project and task overview          |
| 📁 `/projects`      | Project list and creation          |
| 📌 `/projects/:id`  | Project details, members and tasks |
| ✅ `/tasks`          | Task management and filtering      |
| 🔔 `/notifications` | User notifications                 |
| 👨‍💼 `/users`      | Administrator user management      |

---

# ⚡ Getting Started

## 📋 Prerequisites

Before running the project, make sure you have:

* 🟢 Node.js 18+ or a current LTS release
* 📦 npm or Bun
* ☁️ A Supabase project

---

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd code-genie-main
```

---

## 2️⃣ Install Dependencies

### Using npm

```bash
npm install
```

### Using Bun

```bash
bun install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_URL="https://your-project.supabase.co"

VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

> ⚠️ **Security:** Never commit real credentials, service-role keys, or other private environment values to a public repository.

---

## 4️⃣ Start the Development Server

### npm

```bash
npm run dev
```

### Bun

```bash
bun run dev
```

Then open the local URL displayed in the terminal.

---

# 📜 Available Scripts

```bash
npm run dev        # 🚀 Start development server
npm run build      # 📦 Create production build
npm run preview    # 👀 Preview production build
npm run lint       # 🔍 Run ESLint
npm run format     # ✨ Format project files
```

With Bun, replace `npm run` with `bun run`.

---

# 🔐 Authentication

Authentication is handled through **Supabase Auth**.

Users can:

* 👤 Create an account
* 📧 Register with name and email
* 🔑 Sign in with email and password
* 🚪 Sign out securely
* 📊 Continue to the dashboard after authentication

Password validation is performed before submission. Email confirmation can be enabled through the Supabase authentication configuration.

---

# 📁 Project Management

Projects support:

### 📌 Project Information

* Project name
* Description
* Owner
* Team members
* Start date
* Due date

### 📊 Project Status

* 📝 Planning
* 🔄 In Progress
* ✅ Completed
* 📦 Archived

### 🎯 Project Priority

* 🟢 Low
* 🟡 Medium
* 🔴 High

Project owners can update, archive, delete, and manage members within their projects.

---

# ✅ Task Management

Tasks support:

* 📝 Title and description
* 👤 Assignee
* 📊 Status
* 🎯 Priority
* 📅 Due date

### 📊 Task Status

```text
📝 To Do
🔄 In Progress
👀 Review
✅ Completed
```

### 🎯 Task Priority

```text
🟢 Low
🟡 Medium
🟠 High
🔴 Critical
```

Tasks automatically become **overdue** when their due date has passed and the task has not been completed.

---

# 📊 Dashboard

The dashboard gives users a quick overview of their current workspace.

### Key Metrics

```text
📁 Active Projects
📋 Pending Tasks
✅ Completed Tasks
⏰ Overdue Tasks
🔥 High-Priority Tasks
📌 Total Tasks
📈 Completion Progress
```

Project-level progress indicators make it easier to understand workload and progress without opening every project individually.

---

# 🔔 Notifications

The notification center provides a centralized place to track application activity.

Supported features include:

* 🔵 Unread notifications
* ⚪ Read notifications
* 🕐 Notification timestamps
* 🔗 Optional notification links
* ✓ Mark individual notifications as read
* ✓ Mark all notifications as read

---

# 👨‍💼 Admin Features

Administrators have access to additional user-management functionality.

### Admin users can:

* 👥 View registered users
* 🛡️ Identify administrator accounts
* ⚙️ Access user management

Regular users cannot access the administrative user list.

---

# 🗄️ Database

Taskforge uses **Supabase** as its backend data layer with a PostgreSQL database.

Database migrations are maintained under:

```text
drizzle/migrations/
```

### Core Data Entities

```text
👤 Profiles
📁 Projects
👥 Project Members
✅ Tasks
🔔 Notifications
🛡️ User Roles
```

Database access should be protected using appropriate authentication and **Row Level Security (RLS)** policies.

---

# 🚀 Production Build

Create a production build using:

```bash
npm run build
```

Or:

```bash
bun run build
```

After a successful build, deploy the generated application using your preferred hosting platform and configure the required environment variables.

---

# ☑️ Deployment Checklist

Before deploying to production, verify:

* [ ] ☁️ Production Supabase URL is configured
* [ ] 🔑 Production publishable key is configured
* [ ] 🔐 Authentication redirect URLs are configured
* [ ] 🗄️ Database migrations are applied
* [ ] 🛡️ Row Level Security policies are enabled
* [ ] ⚙️ Production environment variables are configured
* [ ] 📦 Production build completes successfully
* [ ] 🔐 Login and registration work correctly
* [ ] 👥 Project permissions work correctly
* [ ] ✅ Task permissions work correctly

---

# 🧹 Code Quality

Before submitting changes, run:

```bash
npm run lint
npm run format
npm run build
```

These checks help maintain consistent formatting, code quality, and production build stability.

---

# 🔒 Security Notes

> **Security is an important part of every production deployment.**

* 🔐 Keep `.env` files private.
* 🚫 Never expose service-role keys in client-side code.
* 🔑 Use publishable Supabase credentials where appropriate.
* 🛡️ Keep authentication and database authorization policies enabled.
* 🔍 Validate permissions at the backend/database level, not only in the UI.
* 📦 Review database migrations before applying them to production.

---

# 🗺️ Future Improvements

Potential future enhancements include:

* 📅 Calendar and timeline views
* 📎 Task file attachments
* 📈 Advanced project analytics
* 📝 Activity history and audit logs
* 🔔 Advanced notification preferences
* 👥 Improved team collaboration
* 🧪 Automated unit and end-to-end testing
* 📊 More detailed reporting and analytics

---

# 📄 License

Add the project's license information here before distributing the application publicly.

---

<div align="center">

### 🚀 Taskforge

**Organize. Track. Collaborate. Deliver.**

🌐 Projects   •   📌 Tasks   •   👥 Teams   •   📊 Progress

</div>

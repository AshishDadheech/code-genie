Taskforge

Taskforge is a modern project and task management web application designed to help teams organize projects, track work, manage members, and monitor progress from a single dashboard.

Overview

The application provides a clean workspace for managing projects and day-to-day tasks. Users can create projects, add team members, assign tasks, set priorities and due dates, and keep track of progress through a centralized dashboard.

Main capabilities

User registration and sign-in

Project creation and management

Project status and priority tracking

Start dates and due dates

Project archiving and deletion

Team member management

Task creation, editing, and deletion

Task assignment to team members

Task status and priority management

Due-date and overdue task tracking

Dashboard with project and task statistics

Progress indicators for projects

Search, filtering, and sorting for tasks

Notifications with read/unread state

Admin-only user management

Responsive interface for different screen sizes

Technology Stack

Frontend: React 19 + TypeScript

Application Framework: TanStack Start

Routing: TanStack Router

Build Tool: Vite

State Management: Redux Toolkit

Server/Data Layer: Supabase

Database Migrations: SQL / Drizzle tooling

Form Handling: React Hook Form

Validation: Zod

UI: Tailwind CSS + Radix UI

Icons: Lucide React

Charts: Recharts

Package Manager: Bun or npm

Project Structure

code-genie-main/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Supabase integration
│   ├── lib/               # Shared types, validation and utilities
│   ├── routes/            # Application routes
│   ├── store/             # Redux store and application state
│   ├── styles.css         # Global styles
│   ├── router.tsx         # Router configuration
│   ├── server.ts          # Server entry
│   └── start.ts           # Application entry
├── drizzle/               # Database migration files
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Application Routes

Route

Purpose

/

Application landing page

/auth

Sign in / registration

/dashboard

Project and task overview

/projects

Project list and project creation

/projects/:id

Project details, members and tasks

/tasks

All tasks with filtering and management

/notifications

User notifications

/users

Admin user management

Getting Started

Prerequisites

Make sure you have the following installed:

Node.js 18+ or a current LTS release

npm or Bun

A Supabase project

1. Clone the repository

git clone <your-repository-url>
cd code-genie-main

2. Install dependencies

Using npm:

npm install

Or using Bun:

bun install

3. Configure environment variables

Create a .env file in the project root.

Use your own Supabase project credentials:

SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_URL="https://your-project.supabase.co"

VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

Do not commit real credentials or secret environment values to a public repository.

4. Start the development server

Using npm:

npm run dev

Using Bun:

bun run dev

Then open the local URL shown in the terminal.

Available Scripts

npm run dev        # Start development server
npm run build      # Create production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format project files

With Bun, replace npm run with bun run.

Authentication

Authentication is handled through Supabase Auth.

Users can:

Create an account with their name, email, and password.

Sign in with email and password.

Continue to the dashboard after successful authentication.

Passwords are validated before submission, and email confirmation can be required depending on the Supabase authentication configuration.

Project Management

Projects support:

Name and description

Status:

Planning

In Progress

Completed

Archived

Priority:

Low

Medium

High

Start date

Due date

Owner

Team members

Project owners can update, archive, or delete their projects and manage project members.

Task Management

Tasks support:

Title and description

Status:

To Do

In Progress

Review

Completed

Priority:

Low

Medium

High

Critical

Assignee

Due date

Overdue tasks are calculated automatically when their due date has passed and the task is not completed.

Dashboard

The dashboard provides an at-a-glance view of:

Active projects

Pending tasks

Completed tasks

Overdue tasks

High-priority tasks

Total tasks

Overall completion progress

Project-level task progress

This makes it easier to understand current workload and project progress without opening every project individually.

Notifications

The notification area displays application notifications with:

Read/unread state

Creation time

Optional links

Individual "Mark as read" actions

"Mark all as read" functionality

Admin Features

Administrators can access the user management section to view registered users and identify administrator accounts.

Regular users do not have access to the admin user list.

Database

The application uses Supabase for its backend data layer.

The project contains database migration files under:

drizzle/migrations/

The application data model includes entities such as:

Profiles

Projects

Project members

Tasks

Notifications

User roles

Database access should be configured with the appropriate authentication and row-level security policies in the Supabase project.

Production Build

Create a production build with:

npm run build

or:

bun run build

After a successful build, use the deployment platform of your choice to host the application and configure the required environment variables.

Deployment checklist

Before deploying, verify:

Production Supabase URL is configured

Production publishable key is configured

Authentication redirect URLs are configured

Database migrations are applied

Row-level security policies are enabled and tested

Production environment variables are configured

The production build completes successfully

Login and registration work correctly

Project and task permissions work as expected

Code Quality

Before submitting changes, it is recommended to run:

npm run lint
npm run format
npm run build

Security Notes

Keep .env files private.

Never expose service-role or other server-side secrets in client-side code.

Use publishable/public Supabase credentials only where appropriate.

Keep authentication and database authorization policies enabled.

Validate permissions on the backend/database, not only in the UI.

License

Add the project's license information here before distributing the application publicly.

Taskforge — a focused workspace for organizing projects, tasks, teams, and progress.

# CampusPulse

CampusPulse is a full-stack campus social platform where students can share updates, post anonymously, and participate in conversations with their university community. It combines a responsive social-feed interface with email/password authentication and PostgreSQL persistence.

## Features

- Public campus feed with responsive social post cards
- Student registration with university and department information
- Email and password authentication
- Authenticated post creation
- Optional anonymous posting
- Optional image URLs on posts
- Post editing restricted to the original author
- Post deletion protected by ownership checks at the server-action layer
- Public post conversations with authenticated commenting
- Responsive layouts for desktop, tablet, and mobile
- Accessible form labels, keyboard focus states, and reduced-motion support

## Technology

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/) and project-level CSS
- [Better Auth](https://www.better-auth.com/) for authentication
- [Prisma ORM for PostgreSQL](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

## Application flow

1. Visitors can view the campus feed and open individual posts without signing in.
2. Students create an account with their name, email, university, and department.
3. Authenticated students can publish standard or anonymous posts.
4. Every post is visible in the shared feed. Anonymous posts hide the author's identity in the interface while retaining ownership on the server.
5. Visitors can read conversations, while authentication is required to add a comment.
6. Post updates and deletions are allowed only when the authenticated user owns the post.

## Project structure

```text
campus-pulse/
|-- app/
|   |-- actions/           # Post and comment server actions
|   |-- api/auth/          # Better Auth route handler
|   |-- login/             # Login page
|   |-- posts/             # Create, view, and edit post routes
|   |-- signup/            # Registration page
|   |-- globals.css        # Shared responsive design system
|   |-- layout.tsx         # Root layout and metadata
|   `-- page.tsx           # Campus feed
|-- components/            # Shared interface components
|-- lib/                   # Authentication and validation modules
|-- migrations/            # Database migration snapshots
`-- src/prisma/            # Prisma contract and database client
```

## Local setup

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 15 or newer

### Installation

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/Mahdeen52/campus-pulse.git
   cd campus-pulse
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Replace the placeholders in `.env` with your local values:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
   BETTER_AUTH_SECRET="generate-a-long-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

5. Emit the Prisma contract:

   ```bash
   npm run contract:emit
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and Better Auth |
| `BETTER_AUTH_SECRET` | Long random secret used to protect authentication data |
| `BETTER_AUTH_URL` | Base URL of the application, such as `http://localhost:3000` locally |

Real environment files are excluded by `.gitignore`. Only `.env.example`, containing non-working placeholders, belongs in source control.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint across the project |
| `npm run contract:emit` | Regenerate the Prisma contract artifacts |

## Routes

| Route | Description |
| --- | --- |
| `/` | Public campus feed |
| `/login` | Student login |
| `/signup` | Student registration |
| `/posts/new` | Authenticated post creation |
| `/posts/[id]` | Post details and comments |
| `/posts/[id]/edit` | Author-only post editor |
| `/api/auth/[...all]` | Better Auth route handler |

## Security notes

- Authentication and ownership checks are performed on the server.
- Anonymous posts still retain an internal author ID so ownership rules continue to work.
- Never commit `.env`, database credentials, authentication secrets, or production URLs.
- Use separate secrets and database credentials for development and production.

## License

No license has been added yet. All rights are reserved by the repository owner.

# FestFlow Backend

A production-ready Node.js backend for the FestFlow college event management platform.

## Features

- **Clean Architecture:** Routes → Controllers → Services → Models.
- **TypeScript:** Fully typed codebase.
- **Authentication:** Firebase Admin SDK integration (JWT verification).
- **Database:** MongoDB Atlas with Mongoose ODMs.
- **Security:** Helmet, CORS, Rate Limiting, HPP, Mongo Sanitize.
- **Transactions:** MongoDB transactions for safe registration and check-in workflows.
- **File Uploads:** Cloudinary integration for images.
- **QR Codes:** Secure QR code generation for tickets.
- **Validation:** Strict request validation using Zod.
- **Logging & Error Handling:** Winston logger and centralized error management.
- **API Documentation:** Swagger UI included.

## Prerequisites

- Node.js 22+
- MongoDB instance (Atlas or local with Replica Set enabled for transactions)
- Firebase Admin SDK Service Account
- Cloudinary Account

## Setup Instructions

1. Clone the repository and navigate to the `Backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual `MONGO_URI`, `FIREBASE_*`, and `CLOUDINARY_*` values.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the server in development mode using `nodemon` and `tsx`.
- `npm run build`: Compiles TypeScript to JavaScript in the `dist/` directory.
- `npm start`: Runs the compiled production code.
- `npm run seed`: Populates the database with dummy data (users, events, registrations).

## API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:8000/api-docs`

A Postman collection (`FestFlow_Postman_Collection.json`) is also included in the root directory.

## Docker

To build and run using Docker:

```bash
docker build -t festflow-backend .
docker run -p 8000:8000 --env-file .env festflow-backend
```

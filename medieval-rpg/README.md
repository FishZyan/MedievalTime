# Medieval Time RPG

A 2D multiplayer RPG built with React, Node.js, Socket.IO, and PostgreSQL.

## Prerequisites
- **Node.js**: v18 or newer
- **PostgreSQL**: Running locally or via a cloud provider

## Local Setup Instructions

### 1. Database & Backend Configuration
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd medieval-rpg/backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the `backend` directory. At minimum, it should contain:
   ```env
   # PostgreSQL Connection String Example
   DATABASE_URL="postgresql://postgres:password@localhost:5432/medieval_rpg"
   JWT_SECRET="super_secret_jwt_key"
   PORT=3001
   ```
4. Push the Prisma schema to your database (Make sure PostgreSQL is running!):
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd medieval-rpg/frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Play the Game!
Once both servers are running successfully, open your web browser and navigate to:
**http://localhost:5173**

> **Tip For Multiplayer Testing**: Open an incognito window or a different web browser side-by-side to register a second account. You'll see both characters sync and move together in real-time across the canvas!

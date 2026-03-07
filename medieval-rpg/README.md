# Medieval Time RPG

A multiplayer 2D RPG game with a medieval theme, built with React, Node.js, Socket.IO, and PostgreSQL.

## Features
- **Real-time Multiplayer:** Players can connect and see each other moving around the map instantly using WebSockets.
- **Authentication:** Secure user registration and login system with JWT and bcrypt hashing.
- **2D Pixel Art:** Features a customized pixel art knight character that correctly flips horizontally based on the player's mouse position to determine facing direction.
- **Dynamic Rendering:** Client-side HTML5 Canvas rendering for optimized game loops.
- **PostgreSQL Database:** Persistent player accounts via Prisma ORM.

## Tech Stack
- **Frontend:** Vite, React, Socket.IO-Client
- **Backend:** Node.js, Express, Socket.IO
- **Database:** PostgreSQL, Prisma (v5)

## How to Run

### Backend
1. Navigate to the `backend` directory.
2. Ensure you have a `.env` file with `DATABASE_URL` and `JWT_SECRET`.
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

Navigate to `http://localhost:5173` in your browser to play!

# MEAN Realtime Admin Dashboard

An Express + MongoDB API with an Angular 16+ client that provides:
- JWT authentication with roles (admin, user)
- Admin user management (create, update role/status, delete)
- Realtime analytics via Socket.IO with Chart.js (line, doughnut, bar)
- Clean, responsive UI with global styling

## Project Structure
- `server/` – Node.js API (Express, Socket.IO, Mongoose)
- `client/` – Angular app (ng2-charts + Chart.js, signals)

## Tech & Versions
- Node.js: 18+ (20+ recommended)
- Server:
  - express ^4.19.2
  - mongoose ^8.3.5
  - jsonwebtoken ^9.0.2
  - socket.io ^4.7.5
  - bcryptjs ^2.4.3
- Client:
  - @angular 21.1.x
  - chart.js ^4.5.1
  - ng2-charts ^8.0.0
  - rxjs ~7.8.0
  - packageManager: npm@11.5.2

## Prerequisites
- MongoDB running locally or a MongoDB Atlas connection string

## Environment
Set these environment variables for the server (or rely on defaults):
- `MONGO_URI` (default: `mongodb://127.0.0.1:27017/mean_dashboard`)
- `PORT` (default: `4001`)
- `ORIGIN` (default: `http://localhost:4200`)
- `JWT_SECRET` (default: dev value; set a strong secret for production)
- `ADMIN_EMAIL` (default: `admin@example.com`)
- `ADMIN_PASSWORD` (default: `admin123`)

## Setup
1) Install dependencies

```
cd server
npm install

cd ../client
npm install
```

2) Start MongoDB

- Local: ensure `mongod` is running, or
- Atlas: get a connection string and set `MONGO_URI`

3) Run the API

Windows (PowerShell):
```
cd server
$env:MONGO_URI="mongodb://127.0.0.1:27017/mean_dashboard"
$env:PORT="4001"
npm start
```

macOS/Linux:
```
cd server
MONGO_URI="mongodb://127.0.0.1:27017/mean_dashboard" PORT=4001 npm start
```

You should see: `API listening on http://localhost:4001`

4) Run the Angular client
```
cd client
npm start
```
Open http://localhost:4200

## Login
- Email: `admin@example.com`
- Password: `admin123`

## Notes
- Data persists in MongoDB.
- Realtime metrics derive from users:
  - `activeUsers` = count of users with status=active
  - `signUps` = total users except seeded admin
- Frontend points to API at `http://localhost:4001` by default.

## Scripts
- Server
  - `npm start` – start API
  - `npm run dev` – start with nodemon (hot reload)
- Client
  - `npm start` – Angular dev server on `:4200`

## Production Tips
- Set a strong `JWT_SECRET`
- Use a managed MongoDB (e.g., Atlas)
- Serve the Angular build via a CDN or static hosting and secure the API behind HTTPS


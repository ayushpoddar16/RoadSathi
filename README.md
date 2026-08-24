# RoadSathi

RoadSathi is a roadside assistance platform that connects customers with nearby mechanics. Customers can request help for vehicle problems, providers can accept nearby jobs, and customers can track the provider in real time.

## Features

- Customer and provider accounts
- JWT-based authentication and role-based routes
- Roadside assistance requests by vehicle and issue type
- Nearby provider matching within a 5 km radius
- Provider online/offline status
- Real-time request, status, and location updates with Socket.IO
- Interactive maps with Leaflet, React Leaflet, and MapTiler
- Provider document uploads through Cloudinary
- Razorpay payment creation and verification
- Customer ratings and request history

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Zustand for persisted authentication state
- Axios for HTTP requests
- Socket.IO Client for real-time communication
- Leaflet and React Leaflet for maps
- MapTiler for map tiles
- Tailwind CSS

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT and bcryptjs authentication
- Socket.IO
- Redis with ioredis
- Cloudinary and Multer for document uploads
- Razorpay for payments

## Project Structure

```text
RoadSathi/
├── client/                 React/Vite frontend
├── server/                 Express backend
├── README.md
└── note.txt
```

## Requirements

- Node.js 22.x
- npm
- MongoDB connection
- Redis connection
- MapTiler API key
- Cloudinary account for document uploads
- Razorpay account for payment features

## Environment Variables

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_MAPTILER_KEY=your_maptiler_key
```

## Installation

Install dependencies in both applications:

```bash
cd server
npm install

cd ../client
npm install
```

## Running Locally

Start the backend in one terminal:

```bash
cd server
npm run dev
```

The API and Socket.IO server run on `http://localhost:5000` by default.

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

Health check:

```text
GET http://localhost:5000/api/health
```

## Available Scripts

### Client

```bash
npm run dev       # Start Vite development server
npm run build     # Create production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

### Server

```bash
npm run dev       # Start the server with nodemon
node src/server.js # Start the server without nodemon
```

## Authentication Flow

1. The user submits email and password to `POST /api/auth/login`.
2. The server checks the user and compares the password with bcryptjs.
3. The server returns a JWT containing the user ID and role.
4. Zustand stores the user and token in browser localStorage under `roadsathi-auth`.
5. Axios sends the token as `Authorization: Bearer <token>` on protected API requests.
6. The backend verifies the token with authentication middleware.
7. Protected routes also check whether the user is a customer or provider.

Socket.IO connections use the same JWT for authentication.

## Location and Real-Time Tracking

```text
Browser GPS
    -> Socket.IO
    -> server
       -> Redis GEOADD
       -> MongoDB provider location update
       -> Socket.IO customer update
    -> customer tracking map
```

- Customer requests use the browser Geolocation API to get one location.
- Providers send their location while online, currently about every 5 seconds.
- Customer request locations are stored in MongoDB as GeoJSON points.
- Provider locations are stored in MongoDB as GeoJSON points.
- Nearby matching currently uses MongoDB `$nearSphere` with a 5,000-meter maximum distance.
- Redis currently receives provider location writes but is not read by the application for matching.
- GeoJSON coordinates use `[longitude, latitude]`; Leaflet positions use `[latitude, longitude]`.

## Main API Areas

| Area           | Base path        | Purpose                                      |
| -------------- | ---------------- | -------------------------------------------- |
| Authentication | `/api/auth`      | Signup and login                             |
| Requests       | `/api/requests`  | Create, view, list, and delete help requests |
| Providers      | `/api/providers` | Provider profile, status, and documents      |
| Payments       | `/api/payments`  | Create and verify Razorpay payments          |
| Admin          | `/api/admin`     | Provider approval                            |

## Main Frontend Routes

| Route                    | Access   | Purpose                     |
| ------------------------ | -------- | --------------------------- |
| `/`                      | Public   | Home page                   |
| `/login`                 | Public   | Login                       |
| `/signup`                | Public   | Account creation            |
| `/customer`              | Customer | Create a help request       |
| `/customer/tracking/:id` | Customer | Track a provider            |
| `/customer/payment/:id`  | Customer | Pay for a completed service |
| `/customer/history`      | Customer | View request history        |
| `/provider`              | Provider | Provider dashboard          |
| `/provider/requests`     | Provider | View incoming requests      |
| `/provider/job/:id`      | Provider | Manage an active job        |
| `/provider/history`      | Provider | View completed jobs         |

## Important Notes

- Browser location requires user permission and works reliably on `localhost` or HTTPS.
- Map display requires a valid `VITE_MAPTILER_KEY`.
- MongoDB and Redis must be reachable when the server starts.
- Provider matching requires the provider to be online, approved, and configured for the requested issue and vehicle type.
- Payment and document upload features require their respective third-party credentials.


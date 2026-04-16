# MedFlow Backend API

Backend API server for MedFlow healthcare management mobile application.

## Features

- Hospital management (CRUD operations)
- Real-time bed availability tracking
- Location-based hospital search
- MongoDB Atlas integration
- RESTful API design
- Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/medflow?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   ```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Hospitals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals` | Get all hospitals (with search, filter, pagination) |
| GET | `/api/hospitals/:id` | Get single hospital by ID |
| GET | `/api/hospitals/nearby` | Get nearby hospitals by coordinates |
| POST | `/api/hospitals` | Create new hospital |
| PUT | `/api/hospitals/:id` | Update hospital |
| PATCH | `/api/hospitals/:id/beds` | Update bed availability |
| DELETE | `/api/hospitals/:id` | Delete hospital |

### Query Parameters

#### Get all hospitals:
- `search` - Search by name, address, or specialists
- `status` - Filter by status (available, moderate, full)
- `sortBy` - Sort field (name, status, rating, createdAt)
- `order` - Sort order (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### Get nearby hospitals:
- `lat` - Latitude (required)
- `lng` - Longitude (required)
- `maxDistance` - Maximum distance in meters (default: 10000)

## Hospital Data Model

```javascript
{
  "name": "Hospital Name",
  "address": "Full Address",
  "distance": "5.2 km",
  "status": "available", // available, moderate, full
  "coordinates": {
    "lat": 23.2599,
    "lng": 77.4126
  },
  "beds": {
    "icu": {
      "total": 25,
      "free": 18
    },
    "general": {
      "total": 80,
      "free": 62
    },
    "ot": {
      "total": 3,
      "free": 2
    }
  },
  "specialists": ["Cardiologist", "Neurosurgeon"],
  "contact": {
    "phone": "+1234567890",
    "email": "hospital@example.com"
  },
  "emergencyServices": true,
  "rating": 4.5
}
```

## Error Handling

All API responses follow this structure:

**Success Response:**
```javascript
{
  "success": true,
  "data": {...},
  "count": 10,
  "total": 25
}
```

**Error Response:**
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Validation

- All required fields are validated
- Bed counts must be logical (free <= total)
- Coordinates must be valid lat/lng values
- Hospital status is automatically calculated based on bed availability

## Deployment

1. Set environment variables in production
2. Install production dependencies
3. Start the server with `npm start`

## Security Features

- CORS configuration
- Helmet.js for security headers
- Input sanitization
- Error message filtering in production

## Development

For development with hot reload:
```bash
npm run dev
```

The server will automatically restart when changes are made.

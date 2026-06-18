# Rick & Morty Character Management System

A full-stack application for managing Rick & Morty characters with image uploads, user authentication, JWT tokens, and CRUD operations.

## Features

- **User Authentication**
  - User registration with validation
  - Secure login with JWT tokens
  - Password hashing with bcrypt
  - Protected routes and endpoints

- **Character Management**
  - Create, read, update, and delete characters
  - Upload and store character images
  - Search and filter characters
  - Character details (name, species, status, etc.)

- **Security**
  - JWT-based authentication
  - Role-based access control
  - Input validation and sanitization
  - CORS enabled

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT (jwt-simple)
- bcryptjs for password hashing
- Multer for file uploads

### Frontend
- React.js
- Axios for API calls
- React Router for navigation
- TailwindCSS or Bootstrap for styling

## Project Structure

```
rick-morty-character-management/
├── server.js
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   └── Character.js
├── routes/
│   ├── auth.js
│   └── characters.js
├── controllers/
│   ├── authController.js
│   └── characterController.js
├── uploads/
│   └── characters/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/venkat3110p/rick-morty-character-managemen.git
   cd rick-morty-character-managemen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your MongoDB URI and JWT secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create new character (protected)
- `PUT /api/characters/:id` - Update character (protected)
- `DELETE /api/characters/:id` - Delete character (protected)
- `POST /api/characters/:id/upload` - Upload character image (protected)

## Environment Variables

See `.env.example` for all required environment variables.

## Getting Started

1. Set up MongoDB connection in `.env`
2. Generate a secure JWT secret
3. Configure upload paths and file size limits
4. Run `npm install` and `npm run dev`

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

MIT License

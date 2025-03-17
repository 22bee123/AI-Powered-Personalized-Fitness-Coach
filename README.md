# AI-Powered Personalized Fitness Coach

A comprehensive fitness application that uses AI to provide personalized workout plans, nutrition advice, and real-time feedback to users.

## Features

### AI Fitness Coach

The AI Fitness Coach feature allows users to interact with an AI assistant that can provide personalized fitness advice, workout recommendations, and nutrition guidance. The coach uses the Gemini API to generate responses based on user queries.

#### How to Use the AI Coach

1. Navigate to the Dashboard
2. Find the AI Coach chat interface
3. Type your fitness-related questions or requests
4. Receive personalized responses from the AI coach

#### Example Queries

- "Can you suggest a workout routine for building upper body strength?"
- "What should I eat before and after a workout?"
- "How can I improve my running endurance?"
- "Can you create a meal plan for weight loss?"
- "What exercises are good for lower back pain?"

### Authentication

The application uses JWT-based authentication to secure user data and API endpoints.

## Technical Stack

### Frontend
- React with TypeScript
- React Router for navigation
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Gemini API for AI-powered responses

## Setup Instructions

### Prerequisites
- Node.js and npm
- MongoDB
- Gemini API key

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
3. Access the application at http://localhost:5173 (or the port shown in your terminal)

## API Endpoints

### AI Coach Endpoints

- `POST /api/ai-coach/chat`: Send a message to the AI coach and receive a response
- `POST /api/ai-coach/workout-suggestions`: Get personalized workout suggestions
- `POST /api/ai-coach/nutrition-advice`: Get personalized nutrition advice

All endpoints require authentication with a valid JWT token.

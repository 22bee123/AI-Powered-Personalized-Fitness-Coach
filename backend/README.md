# AI-Powered Personalized Fitness Coach Backend

## Environment Variables Setup

To run this application properly, you need to set up the following environment variables in a `.env` file in the backend directory:

1. Create a file named `.env` in the backend directory
2. Add the following variables:

```
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here

# OpenAI API Key (if using OpenAI features)
OPENAI_API_KEY=your_openai_api_key_here

# Server Port
PORT=3000
```

### Getting Your Clerk Secret Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to the API Keys section
4. Copy the Secret Key
5. Paste it in your `.env` file

Without a valid Clerk Secret Key, user authentication will not work properly, and you'll see errors when trying to access protected routes.

## Running the Application

After setting up your environment variables:

1. Install dependencies: `npm install`
2. Start the server: `npm start` or `npm run dev` for development mode

The server will run on the port specified in your `.env` file (default: 3000).

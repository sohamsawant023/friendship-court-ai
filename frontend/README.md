# Friendship Court AI - Frontend

Next.js frontend for the Friendship Court AI application.

## Environment Variables

Required environment variable for production:

- `NEXT_PUBLIC_API_URL`: The URL of your deployed FastAPI backend (e.g., `https://your-backend.onrender.com`)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

3. Run the development server:
```bash
npm run dev
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variable `NEXT_PUBLIC_API_URL` with your backend URL
4. Deploy

The build command is automatically set to `npm run build`.

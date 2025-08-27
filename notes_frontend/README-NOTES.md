# Notes Frontend (Qwik)

This is a modern, light-themed Qwik app implementing a personal notes UI with full CRUD in the browser.

Features:
- Create, edit, delete, and list notes
- Responsive layout with header, sidebar, and main notes grid
- In-place dialog for creating/editing notes
- Search filter
- Color palette:
  - Primary: #1976D2
  - Secondary: #424242
  - Accent: #FFC107

Data:
- Notes are stored in a local in-memory store for demo/preview.
- Replace with real backend API calls when available.

Development:
- npm start (or yarn start) for dev mode
- npm run preview to see a production build locally

Next steps to integrate backend:
- Replace local store mutations in src/routes/index.tsx with fetch calls to your backend.
- Ensure environment variables for API base URL are provided by the host (do not hardcode).

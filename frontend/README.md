# Wayne Industries - Asset Management System (Frontend)

## Tech Stack
- React 18
- Vite (dev server)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Recharts (data visualization)
- React Router v6 (navigation)
- Axios (API calls)

## Project Structure

```
frontend/
├── public/
│   └── images/              # Background images
├── src/
│   ├── components/          # Reusable components
│   │   ├── ErrorBoundary.jsx
│   │   ├── Navbar.jsx
│   │   ├── ItemCard.jsx
│   │   ├── InventoryGrid.jsx
│   │   ├── ModalDetail.jsx
│   │   ├── RadarChart.jsx
│   │   ├── KPITile.jsx
│   │   └── VehicleMetricsChart.jsx
│   ├── context/
│   │   └── InventoryContext.jsx    # Global state management
│   ├── hooks/
│   │   ├── useQuery.js             # Data fetching hook
│   │   └── useAuth.js              # Authentication hook
│   ├── pages/
│   │   ├── Armory.jsx              # Main inventory grid
│   │   ├── ControlTower.jsx        # KPI dashboard
│   │   └── AccessControl.jsx       # Auth / biometric scan UI
│   ├── styles/
│   │   └── globals.css             # Global HUD styling
│   ├── App.jsx                     # Router & main layout
│   └── main.jsx                    # Entry point
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
└── index.html
```

## HUD Design

- **Background:** Bludhaven Police image with dark overlay (#0A0A0A, 85% opacity)
- **Border Color:** #2F2F2F (metallic gray)
- **Glow Color:** #00AEEF (tech blue)
- **Highlight Color:** #FFD700 (utility yellow)
- **Font:** Courier New (monospace)
- **Corners:** Straight (no border-radius)
- **Animations:** Framer Motion (scan effects, card transitions)

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env.local` from `.env.example`:
```
VITE_API_URL=http://127.0.0.1:5000
```

## Features

### The Armory (Inventory Page)
- Grid of ally cards and equipment
- Each ally shows image, name, durability progress bar
- Each equipment shows icon and quantity
- Click any card to open modal with detailed info
- Modal displays radar chart (powerstats) for allies
- Fully responsive grid (adapts to screen size)

### Control Tower (Dashboard)
- KPI tiles showing network capacity, response time, durability
- Bar chart comparing vehicle availability
- Line chart showing response readiness

### Access Control (Login)
- Animated retinal scan biometric UI
- Login form with username/password/role selection
- JWT token stored in localStorage
- Role-based access (Admin/Manager/Employee)

## API Integration

All API calls proxy through Vite config to `http://127.0.0.1:5000`:

- `GET /api/allies` - Fetch 3 heroes from Superhero API
- `GET /api/inventory` - Fetch equipment and vehicles
- `POST /api/auth/login` - Get JWT token

All requests include `Authorization: Bearer {token}` header when logged in.

## Performance

- Virtualized grid for 30-100+ items
- Lazy-loaded modal details
- Memoized components
- Code splitting via Vite

## Next Steps

1. Start backend Flask server (see /backend/README.md)
2. Add background image: `frontend/public/images/Bludhaven Police by kwamster.jpg`
3. Run `npm run dev` to start frontend dev server
4. Login at `http://localhost:5173` with test credentials (via backend)

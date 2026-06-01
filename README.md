# Irshad & Company Internswal Overview Management System

A complete enterprise-grade web application for managing company operations including employees, inventory, assets, and analytics.

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (Neon)
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- Recharts (Charts)
- React Query (State Management)
- Lucide React (Icons)
- jsPDF & XLSX (Reports)

## Features

- **Authentication**: JWT-based login system with role-based access (Owner, Manager, Employee)
- **Dashboard**: Beautiful statistics cards with real-time data
- **Employee Management**: Complete employee profiles with work info, authority, device access, and account access
- **Inventory Management**: Track stationary, devices, appliances, furniture, and cleaning essentials across 3 offices
- **Asset Assignments**: Track company assets with assignment history
- **Analytics Dashboard**: Interactive charts and visual analytics
- **Reports**: Generate PDF and Excel reports for employees, inventory, and assets
- **Dark/Light Mode**: Toggle between themes
- **Office-wise Tracking**: All data linked to 3 offices (Irshad & Company Office, IT Office, FJ Office)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Neon recommended)
- npm or yarn

### 1. Clone the Repository
```bash
cd Irshad-Company-Overview
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
```bash
# Copy the example .env file
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

Initialize the database:
```bash
node config/init-db.js
```

Seed admin user:
```bash
node config/seed-admin.js
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`
- Role: `Owner`

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

Start the frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Project Structure

```
Irshad-Company-Overview/
├── server/
│   ├── config/
│   │   ├── db.js           # Database connection
│   │   ├── schema.sql      # Database schema
│   │   ├── init-db.js      # Database initialization
│   │   └── seed-admin.js   # Admin user seeding
│   ├── controllers/        # API controllers
│   │   ├── authController.js
│   │   ├── officeController.js
│   │   ├── employeeController.js
│   │   ├── inventoryController.js
│   │   ├── assetController.js
│   │   ├── activityController.js
│   │   ├── notificationController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── offices.js
│   │   ├── employees.js
│   │   ├── inventory.js
│   │   ├── assets.js
│   │   ├── activity.js
│   │   ├── notifications.js
│   │   └── analytics.js
│   ├── server.js           # Main server file
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Header.jsx
    │   │   ├── GlassCard.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── Modal.jsx
    │   │   ├── EmployeeForm.jsx
    │   │   ├── InventoryForm.jsx
    │   │   ├── AssetForm.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── lib/
    │   │   └── axios.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Inventory.jsx
    │   │   ├── Assets.jsx
    │   │   ├── Analytics.jsx
    │   │   └── Reports.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    ├── package.json
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Offices
- `GET /api/offices` - Get all offices
- `GET /api/offices/:id` - Get office by ID
- `POST /api/offices` - Create office (Owner/Manager)
- `PUT /api/offices/:id` - Update office (Owner/Manager)
- `DELETE /api/offices/:id` - Delete office (Owner)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee (Owner/Manager)
- `PUT /api/employees/:id` - Update employee (Owner/Manager)
- `DELETE /api/employees/:id` - Delete employee (Owner)

### Inventory
- `GET /api/inventory/categories` - Get all categories
- `GET /api/inventory/items` - Get all inventory items
- `GET /api/inventory/totals` - Get inventory totals
- `POST /api/inventory/items` - Create item (Owner/Manager)
- `PUT /api/inventory/items/:id` - Update item (Owner/Manager)
- `DELETE /api/inventory/items/:id` - Delete item (Owner)
- `PATCH /api/inventory/items/:id/quantity` - Update quantity (Owner/Manager)

### Assets
- `GET /api/assets` - Get all asset assignments
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create asset (Owner/Manager)
- `PUT /api/assets/:id` - Update asset (Owner/Manager)
- `DELETE /api/assets/:id` - Delete asset (Owner)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/employees` - Get employee statistics
- `GET /api/analytics/inventory` - Get inventory statistics
- `GET /api/analytics/offices` - Get office statistics

### Activity Logs
- `GET /api/activity` - Get activity logs
- `POST /api/activity` - Create activity log (Owner)

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Default Offices

1. Irshad & Company Office
2. IT Office
3. FJ Office

## Default Inventory Categories

### Stationary
Staplers, Chitpads, Diaries, Punching Machines, Ball Points, Pencils, Envelopes A4, Envelopes Khaaki, Scissors, Markers, Rubber Bands, Stamps, Highlighters, Card Files, A4 Pages, White Files, Calculators, Tissue Boxes

### Devices
Laptops, Mobile Phones, Cameras, Printers, Wifi Routers, Biometric Machines, PTCL Phones, Barcode Scanners, Bill Printers, Illustrator Tablets, Tripods, Mouse, Projectors, Keyboards, LED Screens

### Appliances
Fans, AC, LED Bulbs, Bulbs, High Volt Lights, Dispensers

### Furniture
Chairs, Tables, Sofas, Dustbins, Revolving Chairs, White Boards

### Cleaning
Mops, Brooms, Detergents, Phenyl, Trash Bags, Cleaning Cloths, Glass Cleaner

## User Roles

- **Owner**: Full access to all features including user management
- **Manager**: Can manage employees, inventory, and assets
- **Employee**: Read-only access to most features

## Development

### Running Both Servers

Open two terminal windows:

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

### Building for Production

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run build
npm run preview
```

## Security Notes

- Change the default admin password immediately after first login
- Update JWT_SECRET in production environment
- Use strong database passwords
- Enable SSL for production database connections
- Implement rate limiting for API endpoints in production

## License

This project is proprietary software for Irshad & Company.

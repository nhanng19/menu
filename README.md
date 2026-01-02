# Korean BBQ Menu Ordering App

A simple Next.js app for managing food orders at a Korean BBQ party.

## Features

- **Guest Ordering**: Scan QR code to access table-specific ordering page
- **Menu Management**: Hardcoded menu items
- **Order Limits**: Maximum 10 items per order
- **Cooldown**: 10-minute cooldown between orders per table
- **Kitchen Dashboard**: View and manage incoming orders

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## QR Codes

Each table should have a QR code pointing to:
- Table 1: `http://your-domain/table/1`
- Table 2: `http://your-domain/table/2`
- Table 3: `http://your-domain/table/3`
- Table 4: `http://your-domain/table/4`

Kitchen dashboard: `http://your-domain/kitchen`

## Database

Uses SQLite (database.db) for simplicity. The database is automatically initialized on first run.


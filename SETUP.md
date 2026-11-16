# Quick Setup Guide

Follow these steps to get FarmToHome up and running:

## Step 1: Install MongoDB

Make sure MongoDB is installed and running on your system.

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below into a new file named .env
```

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/farmtohome
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

```bash
# Start backend server
npm start
```

Backend should now be running on http://localhost:5000

## Step 3: Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Optional: Create .env file for custom API URL
# (Defaults to http://localhost:5000 if not set)
```

Create `frontend/.env` (optional):
```
REACT_APP_API_URL=http://localhost:5000
```

```bash
# Start frontend development server
npm start
```

Frontend should open automatically at http://localhost:3000

## Step 4: Test the Application

1. **Register as a Farmer:**
   - Go to Register page
   - Select "Farmer" role
   - Fill in details and register
   - Login with your credentials

2. **Add Products:**
   - Go to "My Dashboard"
   - Click "Add New Product"
   - Fill in product details
   - Save the product

3. **Register as a Consumer:**
   - Logout
   - Register a new account with "Consumer" role
   - Login

4. **Shop:**
   - Go to "Products" page
   - Browse products
   - Add items to cart
   - Go to Cart and place an order

## Troubleshooting

### MongoDB not connecting?
- Check if MongoDB is running: `mongod` or check services
- Verify connection string in `backend/.env`
- Default: `mongodb://localhost:27017/farmtohome` (Note: Backend automatically falls back to built-in local JSON storage if MongoDB is not running, so the app runs out-of-the-box!)

### Port already in use?
- Backend: Change `PORT` in `backend/.env`
- Frontend: React will prompt for different port

### CORS errors?
- Ensure backend is running
- Check `REACT_APP_API_URL` in `frontend/.env` matches backend URL

### Module not found errors?
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Need Help?

Check the main README.md for detailed documentation and API endpoints.



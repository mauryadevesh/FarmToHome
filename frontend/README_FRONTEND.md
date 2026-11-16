# FarmToHome Frontend

A modern React application for the FarmToHome e-commerce platform that connects farmers directly with consumers.

## Features Implemented

### ✅ Core Features
- **Authentication System**: Login/Register with role-based access (Consumer/Farmer)
- **Product Catalog**: Browse and search farm products with filters
- **Product Details**: Detailed view of individual products
- **Responsive Design**: Mobile-first design with modern UI
- **Navigation**: Clean navigation with user context

### 🚧 In Progress
- Shopping cart functionality
- Order management system
- Farmer dashboard for product management

## Technology Stack

- **React 19.2.0** - Modern React with hooks
- **React Router 6.8.0** - Client-side routing
- **Axios 1.3.0** - HTTP client for API calls
- **CSS3** - Custom styling with modern design patterns

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js          # User login component
│   │   └── Register.js       # User registration component
│   ├── Products/
│   │   ├── ProductList.js    # Product listing with filters
│   │   └── ProductDetail.js  # Individual product view
│   ├── Cart/
│   │   └── Cart.js           # Shopping cart (placeholder)
│   ├── Orders/
│   │   └── Orders.js         # Order management (placeholder)
│   ├── Farmer/
│   │   └── FarmerDashboard.js # Farmer dashboard (placeholder)
│   ├── Home/
│   │   └── Home.js           # Landing page
│   └── Layout/
│       └── Navbar.js         # Navigation component
├── contexts/
│   └── AuthContext.js        # Authentication state management
├── services/
│   └── api.js                # API service layer
└── App.js                    # Main application with routing
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root of the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Integration

The frontend is configured to communicate with the backend API running on `http://localhost:5000/api`. The API service layer (`src/services/api.js`) handles all HTTP requests including:

- Authentication (login/register)
- Product management
- Cart operations
- Order processing

## Component Overview

### Authentication Components
- **Login**: User authentication with form validation
- **Register**: User registration with role selection (Consumer/Farmer)
- **AuthContext**: Global authentication state management

### Product Components
- **ProductList**: Grid view with search, filtering, and sorting
- **ProductDetail**: Individual product view with add-to-cart functionality

### Layout Components
- **Navbar**: Responsive navigation with user context
- **Home**: Landing page with hero section and features

## Styling

The application uses custom CSS with a modern, clean design:
- **Color Scheme**: Green farm theme (#2c7a2c)
- **Typography**: System fonts for optimal performance
- **Responsive**: Mobile-first approach with breakpoints
- **Components**: Consistent button, form, and card styles

## Routing

Protected routes are implemented with role-based access:
- `/login` - Login page
- `/register` - Registration page
- `/products` - Product catalog
- `/products/:id` - Product details
- `/cart` - Shopping cart (requires authentication)
- `/orders` - Order history (requires authentication)
- `/farmer-dashboard` - Farmer dashboard (farmer role only)

## Next Steps

### High Priority
1. **Complete Cart Functionality**
   - Add/remove items
   - Quantity management
   - Price calculations

2. **Order Management**
   - Checkout process
   - Order history
   - Order tracking

3. **Farmer Dashboard**
   - Product CRUD operations
   - Order management
   - Sales analytics

### Medium Priority
1. **Enhanced UI/UX**
   - Loading states
   - Error handling
   - Success messages

2. **Additional Features**
   - Product reviews
   - Farmer profiles
   - Search suggestions

## Development Notes

- The API service uses JWT tokens for authentication
- All API calls include error handling
- Components are built with accessibility in mind
- The design follows modern web standards and best practices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding new features:
1. Follow the existing component structure
2. Use consistent styling patterns
3. Implement proper error handling
4. Test responsive design
5. Update this README

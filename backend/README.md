# Florería Encantos Eternos - Backend API

Complete backend system for the flower shop management application.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Testing](#testing)

## ✨ Features

- ✅ JWT Authentication & Authorization
- ✅ Role-based Access Control (admin, empleado, duena)
- ✅ Complete CRUD operations for all entities
- ✅ Dashboard with real-time statistics
- ✅ Sales and inventory management
- ✅ Order tracking system
- ✅ Cash register management
- ✅ Reports and analytics
- ✅ Custom flower arrangements
- ✅ Promotions and events management

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors
- **Logging**: morgan

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository** (if not already done)

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=floreria_system_core
   DB_USER=postgres
   DB_PASSWORD=betojose243
   JWT_SECRET=your-secret-key
   ```

## 🗄️ Database Setup

1. **Create the database**
   ```bash
   psql -U postgres
   CREATE DATABASE floreria_system_core;
   \q
   ```

2. **Run schema migration**
   ```bash
   npm run db:schema
   ```

3. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

4. **Or reset everything (schema + seed)**
   ```bash
   npm run db:reset
   ```

## 🏃 Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Default Users (for testing)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| maria@floreria.com | password123 | admin | Full access |
| ana@floreria.com | password123 | empleado | Sales, orders, inventory |
| patricia@floreria.com | password123 | duena | Reports, products, dashboard |

### Endpoints Overview

#### Authentication
```
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user info
POST   /api/auth/logout         - Logout user
```

#### Dashboard
```
GET    /api/dashboard           - Get dashboard statistics
```

#### Products
```
GET    /api/productos           - Get all products
GET    /api/productos/:id       - Get product by ID
POST   /api/productos           - Create product (admin)
PUT    /api/productos/:id       - Update product (admin)
DELETE /api/productos/:id       - Delete product (admin)
```

#### Inventory
```
GET    /api/inventario          - Get all inventory items
GET    /api/inventario/:id      - Get inventory item by ID
POST   /api/inventario          - Create inventory item
PUT    /api/inventario/:id      - Update inventory item
DELETE /api/inventario/:id      - Delete inventory item
```

#### Sales
```
GET    /api/ventas              - Get all sales
GET    /api/ventas/:id          - Get sale by ID
POST   /api/ventas              - Create sale
```

#### Orders
```
GET    /api/pedidos             - Get all orders
GET    /api/pedidos/:id         - Get order by ID
POST   /api/pedidos             - Create order
PUT    /api/pedidos/:id         - Update order
DELETE /api/pedidos/:id         - Delete order
GET    /api/pedidos/cliente     - Get orders by phone
```

#### Clients
```
GET    /api/clientes            - Get all clients
GET    /api/clientes/:id        - Get client by ID
POST   /api/clientes            - Create client
PUT    /api/clientes/:id        - Update client
DELETE /api/clientes/:id        - Delete client
```

#### Workers
```
GET    /api/trabajadores        - Get all workers
GET    /api/trabajadores/:id    - Get worker by ID
POST   /api/trabajadores        - Create worker (admin)
PUT    /api/trabajadores/:id    - Update worker (admin)
DELETE /api/trabajadores/:id    - Delete worker (admin)
```

#### Expenses
```
GET    /api/gastos              - Get all expenses
GET    /api/gastos/:id          - Get expense by ID
POST   /api/gastos              - Create expense
DELETE /api/gastos/:id          - Delete expense
```

#### Reports
```
GET    /api/reportes            - Get monthly reports
```

#### Cash Register
```
GET    /api/caja/hoy            - Get today's cash register
POST   /api/caja/apertura       - Open cash register
POST   /api/caja/cierre         - Close cash register
GET    /api/caja/historial      - Get cash register history
```

#### Custom Arrangements
```
GET    /api/arreglos            - Get all arrangements
GET    /api/arreglos/:id        - Get arrangement by ID
POST   /api/arreglos            - Create arrangement
PUT    /api/arreglos/:id        - Update arrangement
DELETE /api/arreglos/:id        - Delete arrangement
```

#### Promotions
```
GET    /api/promociones         - Get all promotions
GET    /api/promociones/:id     - Get promotion by ID
POST   /api/promociones         - Create promotion
PUT    /api/promociones/:id     - Update promotion
DELETE /api/promociones/:id     - Delete promotion
```

#### Events
```
GET    /api/eventos             - Get all events
GET    /api/eventos/:id         - Get event by ID
POST   /api/eventos             - Create event
PUT    /api/eventos/:id         - Update event
DELETE /api/eventos/:id         - Delete event
```

### Example Requests

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@floreria.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "María Rodríguez",
    "email": "maria@floreria.com",
    "rol": "admin",
    "cargo": "Administrador/a"
  }
}
```

#### Get Products
```bash
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer <your-token>"
```

#### Create Sale
```bash
curl -X POST http://localhost:3000/api/ventas \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productos": [
      {
        "producto_id": 1,
        "cantidad": 2,
        "precio": 85.00
      }
    ],
    "metodo_pago": "Yape",
    "trabajador_id": 1,
    "cliente_id": 5
  }'
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   └── jwt.js               # JWT configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js     # Error handling
│   │   └── validateRequest.js  # Request validation
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── productos.routes.js
│   │   ├── inventario.routes.js
│   │   ├── ventas.routes.js
│   │   ├── pedidos.routes.js
│   │   ├── clientes.routes.js
│   │   ├── trabajadores.routes.js
│   │   ├── gastos.routes.js
│   │   ├── reportes.routes.js
│   │   ├── caja.routes.js
│   │   ├── arreglos.routes.js
│   │   ├── promociones.routes.js
│   │   └── eventos.routes.js
│   ├── controllers/
│   │   └── [corresponding controllers]
│   ├── services/
│   │   └── [business logic services]
│   └── app.js                   # Express app setup
├── database/
│   ├── schema.sql               # Database schema
│   └── seed.sql                 # Seed data
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. Client sends credentials to `/api/auth/login`
2. Server validates credentials
3. Server generates JWT token
4. Client stores token (localStorage)
5. Client includes token in subsequent requests

### Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload
```json
{
  "id": 1,
  "email": "user@example.com",
  "rol": "admin",
  "nombre": "User Name",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 🧪 Testing

### Manual Testing with curl

Test authentication:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@floreria.com","password":"password123"}'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Testing with Postman

1. Import the API endpoints
2. Set up environment variables for base URL and token
3. Test each endpoint with different roles

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l

# Test connection
psql -U postgres -d floreria_system_core
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token expiration time
- Verify token format in Authorization header

## 📝 Notes

- All passwords in seed data are hashed with bcrypt
- Default password for all test users: `password123`
- Database uses UTC timezone
- API responses follow consistent format
- All monetary values use DECIMAL(10,2)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for Florería Encantos Eternos**

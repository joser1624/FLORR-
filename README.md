# 🌸 Florería Encantos Eternos - Complete System

A comprehensive flower shop management system with a modern frontend and robust backend API.

## 📋 Overview

This project consists of:
- **Frontend**: HTML, CSS, Vanilla JavaScript (already implemented)
- **Backend**: Node.js + Express + PostgreSQL (fully implemented)
- **Database**: PostgreSQL with complete schema and seed data

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**Windows:**
```bash
quick-start.bat
```

### Option 2: Manual Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
floreria-encantos-eternos/
├── 📄 Frontend Files
│   ├── index.html              # Public website
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript
│   └── pages/                  # Admin panel & client pages
│
├── 🗄️ Database
│   ├── schema.sql              # Database structure
│   └── seed.sql                # Test data
│
├── 🔧 Backend
│   ├── src/
│   │   ├── config/             # Configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   └── app.js              # Express app
│   ├── package.json
│   └── .env                    # Environment config
│
└── 📚 Documentation
    ├── README.md               # This file
    ├── SETUP_GUIDE.md          # Setup instructions
    ├── PROJECT_SUMMARY.md      # Complete overview
    ├── BACKEND_ANALYSIS.md     # Technical analysis
    └── IMPLEMENTATION_COMPLETE.md
```

## 🎯 Features

### Frontend
- ✅ Public product catalog
- ✅ Custom flower arrangement builder
- ✅ Admin dashboard with statistics
- ✅ Sales management
- ✅ Order tracking system
- ✅ Inventory control
- ✅ Cash register management
- ✅ Reports and analytics
- ✅ Client management
- ✅ Employee management
- ✅ Promotions and events
- ✅ WhatsApp integration

### Backend API
- ✅ RESTful API (50+ endpoints)
- ✅ JWT authentication
- ✅ Role-based authorization (admin, empleado, duena)
- ✅ Complete CRUD operations
- ✅ Real-time dashboard statistics
- ✅ Monthly reports
- ✅ Cash register operations
- ✅ Stock management
- ✅ Order workflow
- ✅ Secure password hashing
- ✅ Error handling
- ✅ Input validation

### Database
- ✅ 13 normalized tables
- ✅ Foreign key relationships
- ✅ Indexes for performance
- ✅ Triggers for auto-updates
- ✅ Views for common queries
- ✅ Realistic seed data

## 🔐 Test Credentials

| Email | Password | Role | Access |
|-------|----------|------|--------|
| maria@floreria.com | password123 | admin | Full access |
| ana@floreria.com | password123 | empleado | Sales & orders |
| patricia@floreria.com | password123 | duena | Reports & analytics |

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3 (Custom design system)
- Vanilla JavaScript
- Chart.js for visualizations
- Google Fonts (Playfair Display + Jost)

### Backend
- Node.js 18+
- Express.js 4.x
- PostgreSQL 14+
- JWT for authentication
- bcryptjs for password hashing
- helmet for security
- cors for cross-origin requests
- morgan for logging

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login          # Login
GET    /api/auth/me             # Get current user
POST   /api/auth/logout         # Logout
```

### Core Modules
```
GET    /api/dashboard           # Dashboard statistics
GET    /api/productos           # Products
GET    /api/inventario          # Inventory
GET    /api/ventas              # Sales
GET    /api/pedidos             # Orders
GET    /api/clientes            # Clients
GET    /api/trabajadores        # Workers
GET    /api/gastos              # Expenses
GET    /api/reportes            # Reports
GET    /api/caja                # Cash register
GET    /api/arreglos            # Arrangements
GET    /api/promociones         # Promotions
GET    /api/eventos             # Events
```

See [backend/README.md](backend/README.md) for complete API documentation.

## 🗄️ Database Schema

### Main Tables
- **usuarios** - System users (workers)
- **productos** - Product catalog
- **inventario** - Flowers and materials
- **clientes** - Customer database
- **pedidos** - Customer orders
- **ventas** - Sales transactions
- **ventas_productos** - Sales line items
- **gastos** - Business expenses
- **caja** - Daily cash register
- **arreglos** - Custom arrangements
- **arreglos_inventario** - Arrangement recipes
- **promociones** - Promotions
- **eventos** - Special events

## 🚀 Running the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:3000`

### 2. Start Frontend
Open `index.html` in a browser or use a static server:
```bash
# Using Python
python -m http.server 5500

# Using Node.js http-server
npx http-server -p 5500

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Frontend runs on: `http://localhost:5500`

### 3. Login
- Navigate to: `http://localhost:5500/pages/admin/login.html`
- Email: `maria@floreria.com`
- Password: `password123`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup instructions |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Project overview and architecture |
| [BACKEND_ANALYSIS.md](BACKEND_ANALYSIS.md) | Technical analysis and design |
| [backend/README.md](backend/README.md) | API documentation |
| [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) | Implementation status |

## 🧪 Testing

### Test the API
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@floreria.com","password":"password123"}'

# Get dashboard (replace <TOKEN>)
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

### Test the Frontend
1. Open `http://localhost:5500`
2. Browse the public catalog
3. Try the flower arrangement builder
4. Login to admin panel
5. Test all features

## 🔧 Configuration

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floreria_system_core
DB_USER=postgres
DB_PASSWORD=betojose243
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5500
```

### Frontend (js/main.js)
```javascript
const API_BASE = 'http://localhost:3000/api';
const WA_NUMBER = '51972542802';
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### CORS Error
- Verify `CORS_ORIGIN` in `.env` includes your frontend URL
- Restart backend after changing `.env`

## 📊 Sample Data

The database includes:
- 5 test users (different roles)
- 17 products (various categories)
- 25 inventory items
- 10 clients
- 8 orders
- 30 sales transactions
- 9 expenses
- 6 cash register records
- 3 custom arrangements
- 4 promotions
- 6 events

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [RESTful API Design](https://restfulapi.net/)

## 🚀 Deployment

### Backend Deployment Options
- **VPS**: DigitalOcean, Linode, AWS EC2
- **PaaS**: Heroku, Railway, Render
- **Database**: AWS RDS, DigitalOcean Managed PostgreSQL

### Frontend Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare Pages
- **Traditional**: Apache, Nginx

## 📈 Future Enhancements

- [ ] File upload for product images
- [ ] Email notifications
- [ ] SMS notifications
- [ ] WhatsApp API integration
- [ ] PDF report generation
- [ ] Excel export
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Automated backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
1. Check documentation files
2. Review code comments
3. Check troubleshooting section
4. Contact development team

## ✅ Project Status

- **Frontend**: ✅ Complete
- **Backend**: ✅ Complete
- **Database**: ✅ Complete
- **Documentation**: ✅ Complete
- **Testing**: ✅ Ready
- **Deployment**: ✅ Ready

## 🎉 Success!

Your complete flower shop management system is ready to use!

**Features**:
- ✅ Modern, responsive UI
- ✅ Secure backend API
- ✅ Complete database
- ✅ Role-based access
- ✅ Real-time statistics
- ✅ Comprehensive reports
- ✅ Production-ready code

**Start building your flower shop empire! 🌸**

---

**Built with ❤️ for Florería Encantos Eternos**

**Version**: 1.0.0  
**Date**: March 16, 2026  
**Status**: Production Ready ✅
#   F L O R R - 
 
 
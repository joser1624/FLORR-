#!/bin/bash

# =============================================
# FLORERÍA ENCANTOS ETERNOS - QUICK START SCRIPT
# =============================================

echo "🌸 Florería Encantos Eternos - Quick Start Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "📋 Checking prerequisites..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ first"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ first"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Database setup
echo "🗄️  Setting up database..."
echo "Creating database floreria_system_core..."

# Create database
psql -U postgres -c "CREATE DATABASE floreria_system_core;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${YELLOW}⚠️  Database might already exist, continuing...${NC}"
fi

# Run schema
echo "Running database schema..."
psql -U postgres -d floreria_system_core -f database/schema.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema created${NC}"
else
    echo -e "${RED}❌ Schema creation failed${NC}"
    exit 1
fi

# Run seed data
echo "Inserting seed data..."
psql -U postgres -d floreria_system_core -f database/seed.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seed data inserted${NC}"
else
    echo -e "${RED}❌ Seed data insertion failed${NC}"
    exit 1
fi

echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Dependency installation failed${NC}"
    exit 1
fi

# Generate remaining files
echo "Generating remaining modules..."
node generate-remaining-files.js

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "📝 Test Users:"
echo "   Email: maria@floreria.com"
echo "   Password: password123"
echo "   Role: admin"
echo ""
echo "🚀 To start the server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "🌐 Server will run on: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - SETUP_GUIDE.md - Complete setup instructions"
echo "   - backend/README.md - API documentation"
echo "   - PROJECT_SUMMARY.md - Project overview"
echo ""
echo "✅ Next steps:"
echo "   1. Start the backend: cd backend && npm run dev"
echo "   2. Open frontend in browser"
echo "   3. Login with test credentials"
echo "   4. Enjoy! 🌸"
echo ""

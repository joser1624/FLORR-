@echo off
REM =============================================
REM FLORERÍA ENCANTOS ETERNOS - QUICK START SCRIPT (Windows)
REM =============================================

echo.
echo 🌸 Florería Encantos Eternos - Quick Start Setup
echo ==================================================
echo.

REM Check if PostgreSQL is installed
echo 📋 Checking prerequisites...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL is not installed
    echo Please install PostgreSQL 14+ first
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 18+ first
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Database setup
echo 🗄️  Setting up database...
echo Creating database floreria_system_core...

REM Create database
psql -U postgres -c "CREATE DATABASE floreria_system_core;" 2>nul

echo ✅ Database created (or already exists)

REM Run schema
echo Running database schema...
psql -U postgres -d floreria_system_core -f database\schema.sql >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Schema created
) else (
    echo ❌ Schema creation failed
    pause
    exit /b 1
)

REM Run seed data
echo Inserting seed data...
psql -U postgres -d floreria_system_core -f database\seed.sql >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Seed data inserted
) else (
    echo ❌ Seed data insertion failed
    pause
    exit /b 1
)

echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend

REM Install dependencies
echo Installing Node.js dependencies...
call npm install >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencies installed
) else (
    echo ❌ Dependency installation failed
    pause
    exit /b 1
)

REM Generate remaining files
echo Generating remaining modules...
node generate-remaining-files.js

echo.
echo ==================================================
echo 🎉 Setup Complete!
echo ==================================================
echo.
echo 📝 Test Users:
echo    Email: maria@floreria.com
echo    Password: password123
echo    Role: admin
echo.
echo 🚀 To start the server:
echo    cd backend
echo    npm run dev
echo.
echo 🌐 Server will run on: http://localhost:3000
echo.
echo 📚 Documentation:
echo    - SETUP_GUIDE.md - Complete setup instructions
echo    - backend\README.md - API documentation
echo    - PROJECT_SUMMARY.md - Project overview
echo.
echo ✅ Next steps:
echo    1. Start the backend: cd backend ^&^& npm run dev
echo    2. Open frontend in browser
echo    3. Login with test credentials
echo    4. Enjoy! 🌸
echo.

cd ..
pause

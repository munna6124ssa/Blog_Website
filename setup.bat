@echo off
echo 🚀 Setting up BlogSphere...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

:: Install root dependencies
echo 📦 Installing root dependencies...
npm install

:: Install server dependencies
echo 📦 Installing server dependencies...
cd server
npm install
cd ..

:: Install client dependencies
echo 📦 Installing client dependencies...
cd clients
npm install
cd ..

:: Create .env file if it doesn't exist
if not exist "server\.env" (
    echo 📝 Creating .env file...
    copy "server\.env.example" "server\.env"
    echo ⚠️  Please edit server\.env with your actual configuration values
)

echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit server\.env with your database and API credentials
echo 2. Start MongoDB (if using local database)
echo 3. Run 'npm run dev' to start both frontend and backend
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo 🎉 Happy coding!
pause

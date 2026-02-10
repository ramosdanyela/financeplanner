# 💰 Finance Planner

A modern, full-stack financial management application built with React and Node.js that helps users track expenses, analyze spending patterns, and visualize financial data through interactive charts.

![React](https://img.shields.io/badge/React-183.1blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-50.41rple?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13B2AC?style=for-the-badge&logo=tailwind-css)
![Chart.js](https://img.shields.io/badge/Chart.js-40.446384tyle=for-the-badge&logo=chart.js)

## ✨ Features

### 🔐 Authentication & Security

- User registration and login system
- JWT token-based authentication
- Protected routes for secure access
- Persistent login sessions

### 💳 Transaction Management

- Add, edit, and delete financial transactions
- Categorize transactions with categories and subcategories
- Bulk edit functionality for multiple transactions
- Advanced search and filtering capabilities
- Transaction history tracking

### 📊 Data Visualization

- Interactive line charts using Chart.js
- Monthly spending analysis
- Category and subcategory spending breakdowns
- Customizable date range filtering
- Spending rankings and insights

### 🎨 User Experience

- Modern, responsive design with Tailwind CSS
- Dark theme interface
- Intuitive navigation
- Real-time data updates
- Mobile-friendly layout

## 🚀 Tech Stack

### Frontend

- \*\*React180.3 Modern UI library
- \*\*Vite 5.4.1 - Fast build tool and dev server
- \*\*React Router DOM6.260.2lient-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- \*\*Chart.js 4.40.4Interactive charts
- **React Chart.js 2** - React wrapper for Chart.js
- \*\*Axios 1.70.7 - HTTP client for API requests

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── AddTransaction/
│   │   ├── ChartsSummary/
│   │   ├── DetailBox/
│   │   ├── MassEdit/
│   │   ├── Navbar/
│   │   ├── ProtectedRoute/
│   │   ├── SearchBar/
│   │   └── TransactionBox/
│   ├── pages/           # Page components
│   ├── contexts/
│   ├── api/
│   └── assets/
├── public/
├── index.html
└── package.json

backend/express2/        # API Node/Express
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher) – [nodejs.org](https://nodejs.org)
- **MongoDB** – local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recomendado)
- npm or yarn

### Monorepo: Frontend + Backend

O backend oficial fica em **`backend/express2`**, o frontend em **`frontend/`**. Para rodar frontend e backend juntos e testar localmente:

1. **Instalar dependências (raiz, frontend e backend):**

   ```bash
   npm install
   cd frontend && npm install && cd ..
   cd backend/express2 && npm install && cd ../..
   ```

2. **Configurar o backend:** copiar `backend/express2/.env.example` para `backend/express2/.env` e preencher (PORT=4000, MONGODB_URI, TOKEN_SIGN_SECRET, Cloudinary se usar upload).

3. **Subir os dois:**
   ```bash
   npm run dev:all
   ```
   - Backend: http://localhost:4000
   - Frontend: http://localhost:5173

Guia completo (estrutura, env, remoto): **[docs/MONOREPO_FRONTEND_BACKEND.md](docs/MONOREPO_FRONTEND_BACKEND.md)**.

### Só frontend (API em outro lugar)

1. **Clone e instale:**

   ```bash
   git clone https://github.com/yourusername/financeplanner.git
   cd financeplanner
   npm install
   cd frontend && npm install && cd ..
   ```

2. **(Opcional)** Crie `frontend/.env` com `VITE_API_URL=http://localhost:4000` (ou URL da sua API).

3. **Inicie o dev server** (na raiz):

   ```bash
   npm run dev
   ```

4. Abra **http://localhost:5173**

## 📜 Available Scripts

- `npm run dev` - Start frontend only (Vite)
- `npm run dev:backend` - Start backend only (backend/express2)
- `npm run dev:all` - Start backend + frontend together (local testing)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### API Endpoints

The application connects to a backend API with the following configuration:

- **Development**: `http://localhost:400
- **Production**: `https://expressfinanceplanner-production.up.railway.app`

### Authentication

- JWT tokens are automatically included in API requests
- User sessions persist across browser sessions
- Protected routes require valid authentication

## 📱 Usage

### Getting Started

1. Create an account or log in to your existing account
   2e to the dashboard to view your financial overview3 first transaction using the transaction form4Explore charts and analytics to understand your spending patterns

### Key Features

- **Dashboard**: Quick overview of your financial status
- **Transactions**: Manage all your income and expenses
- **Charts**: Visualize spending patterns and trends
- **Profile**: Update your account information

## 🎯 Key Features in Detail

### Transaction Management

- Add transactions with detailed categorization
- Edit existing transactions
- Delete transactions with confirmation
- Bulk edit multiple transactions
- Advanced filtering by date, category, and amount

### Data Visualization

- Monthly spending trends
- Category-based spending analysis
- Interactive charts with zoom and pan
- Customizable date ranges
- Export capabilities for reports

### User Experience

- Responsive design works on all devices
- Dark theme for comfortable viewing
- Intuitive navigation and user flow
- Real-time data synchronization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -mAdd some amazing feature`)
   4.Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add appropriate comments and documentation
- Test your changes thoroughly
- Update the README if necessary

## 📞 Support

If you have any questions or need support, contact me: ramos.danyela@gmail.com

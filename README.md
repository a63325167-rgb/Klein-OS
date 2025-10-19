# Kleinpaket Eligibility Checker

A comprehensive single-page web application for checking Kleinpaket eligibility and calculating shipping costs, VAT, Amazon fees, and profit analysis for European markets.

## 🚀 Features

### Core Functionality
- **Kleinpaket Eligibility Check**: Instantly determine if products qualify for Kleinpaket shipping
- **Advanced Profit Analysis**: Calculate shipping costs, VAT, Amazon fees, and ROI
- **Dynamic Insights**: AI-powered analysis with market positioning and risk assessment
- **Multi-Country Support**: Accurate VAT rates and shipping costs for all EU countries

### Subscription Tiers
- **Free Plan**: 3 calculations per day, basic features
- **Premium Plan** (€19.99/month): Unlimited calculations, history tracking, bulk upload/export
- **Pro Plan** (€49.99/month): API access, team collaboration, custom formulas

### Premium Features
- **Calculation History**: Track and manage all your calculations
- **Bulk Upload**: Process CSV/Excel files with multiple products
- **Advanced Analytics**: Detailed insights and reporting
- **Export Options**: CSV, XLSX, and PDF exports

### Pro Features
- **API Access**: RESTful API with API key authentication
- **Team Workspace**: Collaborate with team members
- **Custom Formulas**: Advanced calculation customization
- **Webhook Integrations**: Real-time notifications

## 🛠️ Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling and responsive design
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **SQLite** database with SQLite3
- **JWT** authentication with refresh tokens
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Nodemailer** for email functionality
- **Express Rate Limit** for API protection

### Additional Libraries
- **XLSX** for Excel file processing
- **CSV Parser** for CSV file processing
- **PDFKit** for PDF generation
- **UUID** for unique identifiers

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kleinpaket-eligibility-checker
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
nano .env
```

### 4. Start the Development Servers
```bash
# Start both frontend and backend (recommended)
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only (in another terminal)
cd client && npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/v1/health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `SESSION_SECRET` | Session secret | - | Yes |
| `SMTP_URL` | Email service URL | - | Yes |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 | No |
| `DEMO_MODE` | Enable demo mode | true | No |
| `API_RATE_LIMIT` | API rate limit per minute | 100 | No |
| `MAX_CALCULATIONS_FREE` | Free plan daily limit | 3 | No |

### Demo Mode

When `DEMO_MODE=true`:
- Users can upgrade to Premium/Pro without payment
- Demo admin user is created: `admin@kleinpaket.com` / `admin123`
- All features are unlocked for testing

**⚠️ Important**: Set `DEMO_MODE=false` before deploying to production!

## 📊 Kleinpaket Rules

The application enforces strict Kleinpaket eligibility rules:

- **Length**: ≤ 35.3 cm
- **Width**: ≤ 25.0 cm  
- **Height**: ≤ 8.0 cm
- **Weight**: ≤ 1.0 kg
- **Price**: ≤ 60.00 €

All conditions must be met for Kleinpaket eligibility.

## 🔌 API Documentation

### Authentication
All API endpoints (except auth) require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/password-reset` - Request password reset
- `POST /api/v1/auth/password-reset/confirm` - Confirm password reset

#### Calculations
- `POST /api/v1/calculate/check` - Quick eligibility check (Free)
- `POST /api/v1/calculate/analyze` - Full analysis (Premium/Pro)

#### History (Premium+)
- `GET /api/v1/history` - Get calculation history
- `GET /api/v1/history/stats` - Get statistics
- `DELETE /api/v1/history/:id` - Delete calculation

#### Bulk Processing (Premium+)
- `POST /api/v1/bulk/upload` - Upload CSV/Excel file
- `GET /api/v1/bulk/session/:id` - Get session status
- `GET /api/v1/bulk/session/:id/results` - Get results

#### API Keys (Pro+)
- `POST /api/v1/api/keys` - Create API key
- `GET /api/v1/api/keys` - List API keys
- `DELETE /api/v1/api/keys/:id` - Revoke API key

#### Teams (Pro+)
- `POST /api/v1/teams` - Create team
- `POST /api/v1/teams/:id/invite` - Invite member
- `GET /api/v1/teams` - List user's teams

### API Usage Example

```javascript
// Quick eligibility check
const response = await fetch('/api/v1/calculate/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  body: JSON.stringify({
    product_name: "Sample Product",
    buying_price: 10.00,
    selling_price: 25.00,
    destination_country: "Germany",
    length_cm: 30.0,
    width_cm: 20.0,
    height_cm: 6.0,
    weight_kg: 0.5
  })
});

const result = await response.json();
console.log(result.eligibility); // true/false
```

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- `users` - User accounts and subscription info
- `calculations` - Calculation history and results
- `bulk_sessions` - Bulk upload processing sessions
- `api_keys` - API key management
- `teams` - Team workspaces
- `team_members` - Team membership and roles
- `invitations` - Team invitation tokens
- `usage_logs` - API usage tracking

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=kleinpaket.test.js
```

### Test Coverage
The test suite includes:
- Unit tests for Kleinpaket eligibility logic
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Edge case testing for boundary values

## 🚀 Deployment

### Production Checklist
1. Set `DEMO_MODE=false` in environment
2. Generate secure JWT and session secrets
3. Configure production email service
4. Set up proper database (PostgreSQL recommended)
5. Configure reverse proxy (nginx)
6. Set up SSL certificates
7. Configure monitoring and logging

### Docker Deployment
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Development

### Project Structure
```
kleinpaket-eligibility-checker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   └── database/        # Database initialization
├── uploads/             # File upload directory
├── database/            # SQLite database files
└── package.json
```

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement backend API endpoints
3. Create frontend components
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@kleinpaket.com
- **Discord**: [Join our community](https://discord.gg/kleinpaket)

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with major e-commerce platforms
- [ ] Multi-language support
- [ ] Advanced team collaboration features
- [ ] Webhook system for real-time updates

### Known Issues
- [ ] CSV export formatting improvements
- [ ] Better error handling for large file uploads
- [ ] Performance optimization for bulk processing

---

**Built with ❤️ for European e-commerce sellers**


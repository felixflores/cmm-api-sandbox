# CMM API Sandbox - Frontend

A modern React web interface for the CoverMyMeds API Sandbox that provides an intuitive way to interact with the Prior Authorization API endpoints.

## Features

- 📊 **Dashboard** - View and manage all PA requests with real-time stats
- 🔧 **Request Builder** - Step-by-step form wizard for creating PA requests  
- 🔍 **Request Details** - Comprehensive view with status timeline and token management
- 🎫 **Token Management** - Generate, view, and revoke access tokens
- 📋 **Dynamic Forms** - Render request page forms based on API responses
- 🎨 **Modern UI** - Built with Tailwind CSS and Headless UI components

## Tech Stack

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Vitest** - Next generation testing framework
- **React Testing Library** - Simple and complete testing utilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- CMM API Backend running on `http://localhost:3000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### API Configuration

The frontend is configured to proxy API requests to the backend:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000` (proxied as `/api/*`)

### Authentication Setup

The app requires API credentials to interact with the CMM API:

1. **API Key**: Set in the UI or localStorage as `apiKey`
2. **Access Tokens**: Generated through the token management interface
3. **Basic Auth**: For token creation/deletion operations

## Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI interface
npm run test:coverage # Run tests with coverage report
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── forms/          # Form-specific components
├── pages/              # Page components (Dashboard, RequestDetails)
├── services/           # API client and external services
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── utils/              # Utility functions
└── types/              # Type definitions
```

## Testing

The project uses **Test-Driven Development (TDD)** with comprehensive test coverage:

- **Unit Tests**: Component behavior and API interactions
- **Integration Tests**: Multi-component workflows  
- **Mocking**: API calls and external dependencies
- **Accessibility**: Screen reader and keyboard navigation testing

### Running Tests

```bash
# Watch mode (recommended during development)
npm run test

# Single run with coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

## API Integration

### Endpoints Covered

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Dashboard | `/requests/search` | POST | List all requests |
| Create Request | `/requests` | POST | Create new PA request |
| Request Details | `/requests/:id` | GET | Get request details |
| Update Request | `/requests/:id` | PUT | Update request memo |
| Delete Request | `/requests/:id` | DELETE | Delete request |
| Token Management | `/requests/tokens` | POST | Generate access tokens |
| Token Revocation | `/requests/tokens/:id` | DELETE | Revoke access token |
| Request Pages | `/request-pages/:id` | GET | Get dynamic form structure |

### Authentication

The app handles multiple authentication methods:

1. **API Key Authentication**
   - Required for most operations
   - Added as `api_id` query parameter
   - Set in localStorage or UI

2. **Token-based Authentication** 
   - For request-specific operations
   - Generated via token management
   - Added as `token_id` query parameter

3. **Basic Authentication**
   - For token creation/deletion
   - Uses username/password credentials

## Development Guidelines

### Component Development

1. **Test-First Approach**: Write tests before implementation
2. **Component API**: Design props and behavior through tests
3. **Accessibility**: Ensure keyboard navigation and screen reader support
4. **Error Handling**: Graceful degradation and user feedback

### Code Style

- **ESLint**: Automated code quality checking
- **Prettier**: Consistent code formatting (if configured)
- **Tailwind**: Utility-first CSS approach
- **TypeScript**: Consider migrating for better type safety

## Deployment

### Production Build

```bash
npm run build
```

Generates optimized static files in `dist/` directory.

### Environment Variables

Create `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=CMM API Sandbox
```

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Docker**: Container-based deployment

## Contributing

1. **Follow TDD**: Write tests first, then implement
2. **Run Tests**: Ensure all tests pass before committing
3. **Code Quality**: Run linting and fix any issues
4. **Documentation**: Update README for new features

## Troubleshooting

### Common Issues

**API Connection Errors**
- Ensure backend is running on `http://localhost:3000`
- Check CORS configuration in backend
- Verify API key and authentication setup

**Build Failures**
- Clear `node_modules` and reinstall dependencies
- Check Node.js version compatibility
- Verify all imports are correct

**Test Failures**
- Check mock implementations match actual API responses
- Ensure test environment setup is correct
- Review component prop requirements

## License

ISC License - See backend project for details.
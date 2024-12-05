# Expense Tracker

A modern, responsive web application for tracking personal finances built with Angular and Cloudflare Pages.

## Features

- 💰 Track both income and expenses
- 📊 View financial summaries and balance calculations
- 🏷️ Categorize transactions
- 🔍 Advanced filtering and sorting capabilities
- 📱 Responsive design for all devices
- 🌓 Light/dark mode support
- ⚡ Fast and reliable with Cloudflare KV storage

## Tech Stack

- **Frontend Framework**: Angular 19
- **State Management**: NgRx
- **Styling**: Tailwind CSS + Angular Material
- **Data Storage**: Cloudflare KV
- **Deployment**: Cloudflare Pages
- **Package Manager**: Yarn

## Prerequisites

- Node.js >= 20.15.1
- Yarn >= 1.22.22
- Wrangler CLI (for Cloudflare development)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

1. Install dependencies:

```bash
yarn install
```

1. Set up local development environment:

```bash
# Start the development server
yarn start

# Start Cloudflare Pages development server
yarn start-wrangler
```

The application will be available at `http://localhost:4200`

## Environment Setup

Create environment files in `src/environments/`:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8788/api'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

## Project Structure

```shell
src/
├── app/
│   ├── components/       # Reusable UI components
│   ├── interfaces/       # TypeScript interfaces
│   ├── pages/           # Route components
│   ├── services/        # Business logic and API calls
│   ├── store/           # NgRx state management
│   │   ├── actions/
│   │   ├── effects/
│   │   ├── reducers/
│   │   └── selectors/
│   └── utils/           # Helper functions
├── assets/              # Static files
├── environments/        # Environment configurations
└── styles/             # Global styles
```

## Available Scripts

- `yarn start` - Start development server
- `yarn build` - Build production bundle
- `yarn test` - Run unit tests
- `yarn lint` - Run linting
- `yarn start-wrangler` - Start Cloudflare Pages development server
- `yarn deploy` - Deploy to Cloudflare Pages

## Features in Detail

### Transaction Management

- Add, edit, and delete transactions
- Categorize transactions as income or expense
- Add notes and dates to transactions
- Automatic balance calculations

### Categories

- Predefined expense and income categories
- Custom category creation
- Color coding for visual organization

### Filtering and Sorting

- Filter by date range
- Filter by category
- Filter by transaction type
- Sort by amount or date
- Search transactions by name or notes

### Data Visualization

- Total balance display
- Income vs expenses breakdown
- Category-wise expense distribution
- Monthly trends

## Cloudflare KV Storage

The application uses Cloudflare KV for data persistence. The storage structure is:

```shell
KV_NAMESPACE
├── expenses/           # Transaction records
│   └── {id}           # Individual transaction
├── categories/        # Category definitions
└── user_preferences/ # User settings
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The project includes both unit and integration tests:

```bash
# Run all tests
yarn test

# Run tests with coverage report
yarn test --code-coverage

# Run tests in watch mode
yarn test --watch
```

## Deployment

The application is configured for deployment to Cloudflare Pages:

1. Build the application:

```bash
yarn build-cf
```

2. Deploy to Cloudflare Pages:

```bash
yarn deploy
```

## License

This project is licensed under the MIT License.

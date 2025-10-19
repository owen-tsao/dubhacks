# BranchPoint - Code Your Life Decisions Like Git

BranchPoint is an MVP application that helps you make better life decisions by using Git-like branching concepts. Create decision branches, simulate outcomes with AI, and merge your way to better choices.

## 🚀 Features

- **Decision Branching**: Create multiple paths for any life decision, just like Git branches
- **AI Simulation**: Chat with your future self who has already experienced each path
- **Smart Comparison**: Get AI-generated diffs showing tradeoffs, conflicts, and recommendations
- **Confidence Tracking**: Monitor how your confidence changes throughout the decision process
- **A/B Testing**: Built-in experimentation with Statsig integration

## 🏗️ Architecture

### Backend (AWS Serverless)
- **Lambda Functions**: Node.js 18.x runtime with TypeScript
- **DynamoDB**: NoSQL database for decisions, branches, conversations, and events
- **API Gateway**: RESTful API with CORS support
- **Amazon Bedrock**: AI-powered simulation and comparison generation (mocked for demo)
- **AWS Cognito**: User authentication and authorization (demo-ready)
- **Statsig**: Analytics and A/B testing platform

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server

## 📁 Project Structure

```
branchpoint/
├── backend/                 # AWS Lambda functions
│   ├── functions/
│   │   ├── createDecision.ts
│   │   ├── createBranch.ts
│   │   ├── simulateBranch.ts
│   │   ├── generateComparison.ts
│   │   ├── commitDecision.ts
│   │   ├── types.ts
│   │   └── utils/
│   ├── serverless.yml       # Serverless Framework config
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── api.ts
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured
- Serverless Framework CLI

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your AWS and Statsig credentials
   ```

3. **Start local development**:
   ```bash
   npm run dev
   ```

4. **Deploy to AWS**:
   ```bash
   npm run deploy
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your API URL and Statsig client key
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

### Full Stack Development

From the root directory:

```bash
# Install all dependencies
npm install

# Start both backend and frontend
npm run dev

# Build everything
npm run build

# Deploy everything
npm run deploy
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_USER_POOL_CLIENT_ID=your-cognito-user-pool-client-id
STATSIG_SERVER_KEY=your-statsig-server-key
BEDROCK_MODEL=anthropic.claude-v2
AWS_REGION=us-east-1
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_STATSIG_CLIENT_KEY=your-statsig-client-key
```

## 📊 API Endpoints

### Decisions
- `POST /decisions` - Create a new decision
- `GET /decisions` - List user's decisions
- `GET /decisions/{id}` - Get decision details with branches

### Branches
- `POST /decisions/{id}/branches` - Create a new branch

### Simulation
- `POST /simulate` - Simulate a branch with AI

### Comparison
- `GET /decisions/{id}/comparison` - Generate comparison between branches

### Commit
- `POST /decisions/{id}/commit` - Commit to a final decision

## 🎯 Key Features Implemented

- **Git-like Decision Branching**: Create multiple paths for life decisions
- **AI Future-Self Simulation**: Chat with your future self using mocked Bedrock responses
- **Smart Comparison**: AI-generated diffs showing tradeoffs and recommendations
- **Confidence Tracking**: Monitor decision confidence changes
- **A/B Testing Ready**: Statsig integration for experimentation
- **Modern UI/UX**: Beautiful, responsive interface with Tailwind CSS
- **Guest Access**: Demo mode without authentication
- **Type Safety**: Full TypeScript implementation

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend (AWS)
```bash
cd backend
serverless deploy
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy to your preferred platform
```

## 🔍 Demo Flow

1. **Create Decision**: Define your life decision with title, description, and confidence level
2. **Branch Paths**: Create 2-3 different options for your decision
3. **Simulate**: Chat with your future self who experienced each path
4. **Compare**: Get AI-generated analysis of tradeoffs and recommendations
5. **Commit**: Make your final choice with increased confidence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions or issues:
- Create an issue in the repository
- Check the documentation
- Review the API specifications

## 🎯 Next Steps

- [ ] Real AWS Bedrock integration
- [ ] Real Cognito authentication
- [ ] Real Statsig integration
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Team decision making
# MyHairBuddy - Hair Transplant CRM with AI

A comprehensive CRM system for tracking hair transplant surgeons and clinics, built with Next.js, Firebase, and AI-powered features with integrated payment system.

## 🚀 Features

### Core CRM Features
- **Surgeon Management**: Add, track, and organize hair transplant surgeons
- **Contact Tracking**: Track outreach, responses, consultations, and pricing
- **Advanced Filtering**: Filter by location, status, ratings, and more
- **Google Places Integration**: Find surgeons using Google Places API
- **Spreadsheet Import**: Bulk import surgeon data from CSV/Excel files

### AI-Powered Tools (Credit-Based)
- **Note Summarization** (1 credit): Condense lengthy notes into summaries
- **Email Drafting** (2 credits): Generate professional outreach emails
- **Surgeon Analysis** (3 credits): AI-powered suitability analysis

### Payment & Credit System
- **Stripe Integration**: Secure payment processing
- **Credit Packages**: Starter (25), Professional (100), Premium (250) credits
- **Usage Tracking**: Detailed analytics and usage insights
- **Real-time Balance**: Live credit balance display

### Analytics & Insights
- **Usage Analytics**: Track AI feature usage patterns
- **Monthly/Weekly Stats**: Monitor activity trends
- **Feature Breakdown**: See which AI tools you use most
- **Credit History**: Track purchases and consumption

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **AI**: Google Genkit with Gemini 2.0 Flash
- **Payments**: Stripe
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation
- **Error Handling**: Comprehensive error boundary system

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- Google AI API key (for Gemini)
- Stripe account (for payments)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd myhairbuddy
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google AI (Genkit)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_SDK_CONFIG={"type":"service_account","project_id":"..."}
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your config from Project Settings > General > Your apps

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up a webhook endpoint: `your-domain.com/api/stripe/webhook`
4. Add webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 5. Google AI Setup

1. Get a Google AI API key from [Google AI Studio](https://aistudio.google.com)
2. Add the key to your environment variables

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 💳 Credit System

### Credit Costs
- **Note Summarization**: 1 credit
- **Email Drafting**: 2 credits
- **Surgeon Analysis**: 3 credits

### Credit Packages
- **Starter Pack**: 25 credits for $9.99
- **Professional Pack**: 100 credits for $29.99 (Most Popular)
- **Premium Pack**: 250 credits for $59.99

### Free Credits
- New users get 5 free AI credits on signup
- Credits never expire

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Testing Payments

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your production environment, including:
- Firebase configuration
- Google AI API key
- Stripe keys (use live keys for production)
- Stripe webhook secret

## 🔒 Security

- All API routes are protected with authentication
- Stripe webhooks are verified with signatures
- User data is isolated per user in Firestore
- Error handling prevents sensitive data exposure

## 📊 Analytics

The app tracks:
- AI feature usage by type
- Daily and monthly usage patterns
- Credit consumption and purchases
- User engagement metrics

## 🎯 MVP Status

✅ **Completed Features:**
- User authentication and management
- Surgeon CRUD operations with advanced filtering
- AI features with credit system integration
- Stripe payment processing
- Usage analytics and tracking
- Comprehensive error handling
- Real-time credit balance display

🚀 **Ready for Production!**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the error logs in the browser console
2. Verify all environment variables are set correctly
3. Ensure Firebase and Stripe are properly configured
4. Check the GitHub issues for similar problems


Input: Surgeon’s public info + user's private notes/tracking data.


Output:


suitabilityAnalysis: AI-written analysis of suitability for the user.


suggestedNextSteps: AI suggestions based on analysis.


Prompting: Structured prompt gives LLM context: “Act as an AI assistant for hair transplant decision-making, analyze based on data...”


Other Flows: Similar structure for note summarization, email drafting, etc.



6. Code Organization (Key Files)
package.json: Shows dependencies (Next.js, React, Tailwind, Firebase, Genkit, etc.)


src/lib/firebase.ts: Initializes Firebase Auth + Firestore, using env vars for config.


src/ai/genkit.ts: Sets up Genkit, configures Gemini as the default AI model.


src/ai/flows/analyze-surgeon.ts: Main AI analysis logic (see above).



7. Why This Setup?
Fast Iteration: Next.js + Firebase = instant prototyping, real-time DB, easy auth.


Consistent UI: Tailwind + Radix-UI for quick, clean, accessible components.


Scalable AI: Genkit lets you quickly add new LLM-powered features.


LLM Friendly: All inputs/outputs are structured for easy LLM reasoning.



8. Example User Story (End-to-End):
User signs up/logs in.


Adds surgeons they’re interested in (manually, via spreadsheet import, or Google search).


Tracks which surgeons responded, prices, consults, and adds personal notes.


Uses AI to get a summary of their notes or an analysis of which surgeon might be best for them.


Uses the draft outreach feature to email clinics for more info or to set up a consult.



9. Summary Table: Core Features & Their Tech
Feature
Tech/Libs Used
AI-Powered?
File/Flow
Auth
Firebase Auth
No
src/lib/firebase.ts
Dashboard & Search
Next.js, React, Firestore
No
/src/pages, /src/components
Surgeon Tracking
Firestore, React, Forms
No
/src/pages, /src/components
Add Surgeon Manually
React, Forms
No
/src/pages, /src/components
Import from Spreadsheet
CSV parsing lib, Firestore
No
/src/pages, /src/components
Add via Google Search
Google Places API, Firestore
No
/src/pages, /src/components
Summarize Notes
Genkit + Gemini
Yes
/src/ai/flows/summarize-notes.ts
Draft Outreach Email
Genkit + Gemini
Yes
/src/ai/flows/draft-email.ts
Analyze Suitability
Genkit + Gemini
Yes
/src/ai/flows/analyze-surgeon.ts


10. Data Entry UX
Manual: For single surgeons or personalized notes.


Spreadsheet: For users switching from another tool or managing a large shortlist.


Google Search: For quick, accurate surgeon info import (reducing typos and data entry).



11. Onboarding Notes for LLMs or Devs
All AI features follow the pattern:


Define input/output schema with Zod.


Write prompt for Gemini.


Wrap in Genkit flow (callable from frontend).


All user actions update Firestore, which is the source of truth.


UI is designed for speed and clarity (quick add, filter, edit, analyze).


Everything is tracked (dates, costs, interactions, notes).




"# surgeon" 

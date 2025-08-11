# **App Name**: FollicleFlow

## Core Features:

- Surgeon Database: Pre-populated database of hair transplant surgeons from the USA and Turkey, including clinic name, location, specialties, and public reviews.
- Main Dashboard: Dashboard displaying key metrics such as total doctors, contacted, responded, price given, and consult done. Surgeon cards are color-coded based on progress.
- Filtering & Sorting: Filter surgeons by location (country, state), contact status, reviews, and pricing. Sort by reviews (high to low) or cost (low to high, high to low).
- Detailed Surgeon Modal: Detailed modal window for each surgeon with tabs for details & tracking, contact & links, and AI tools.
- Details & Tracking Tab: Log outreach date, response date, personal rating, actual cost/estimate, and notes. Checkboxes to mark price given or consult done.
- Contact & Links Tab: Manage and update contact information, including free consult link and social media URLs.
- AI Tools Tab: AI-powered tool tab that summarizes notes, drafts outreach emails, and analyzes surgeon suitability using all available data to suggest next steps.
- Summarize Notes: AI tool to create short, medium, or long summaries of extensive notes, pulling out key details.
- Draft Outreach Email: AI tool to generate a polite, professional email to the surgeon, personalized with surgeon data and user notes, inquiring about a consultation and pricing.
- Analyze Surgeon: AI tool providing a comprehensive analysis based on all available data (surgeon's public info and user's private tracking data) to assess their suitability and suggest next steps. It is a tool.
- Find & Add New Surgeons: Search for surgeons by specialty and location using the Google Places API. Add new surgeons to your list with a single click.
- Personal & Persistent Storage: Secure Firebase database connected to the app, ensuring all notes, dates, ratings, and custom links are tied to the user's unique ID and saved automatically in real-time.

## Style Guidelines:

- Primary color: Light teal (#73D6C2) to represent health and precision.
- Background color: Light gray (#F0F2F5), creating a clean, professional feel.
- Accent color: Soft lavender (#A894FF) to add a touch of elegance.
- Body and headline font: 'Inter', a sans-serif font, is recommended for its clean and modern appearance.
- Use line icons to maintain a minimal and modern look.
- Employ a clean, grid-based layout to ensure easy navigation.
- Use subtle animations to indicate data changes or state transitions.
# AgriPulse AI: Climate-Smart Agricultural Hub

AgriPulse AI is an AI-driven agricultural tool designed to empower smallholder farmers in East Africa. It provides localized, multi-lingual, and offline-first advisory services to help farmers diagnose crop stress, receive climate-smart planting schedules, and manage daily farm activities.

## 🌟 Key Features

- **AI Crop Diagnosis:** Upload photos of crop issues (pests, diseases, yellowing) for instant AI analysis and treatment recommendations.
- **Climate-Smart Planting Schedules:** Generate localized planting calendars based on your crop type and specific location.
- **Real-time Weather Insights:** Localized weather data with customizable units (Celsius/Fahrenheit).
- **Multi-lingual Support:** Available in English, Swahili, Hausa, French, and Spanish.
- **Offline-First Design:** Works even with intermittent internet connectivity using Firestore's offline persistence.
- **Guest Access:** Core advisory features (Diagnosis & Schedules) are open to all users without requiring an account.
- **Personalized Task Manager:** Logged-in users can track daily farm activities and maintain a history of reported issues.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Animations:** Motion (Framer Motion).
- **Backend/Database:** Firebase (Authentication & Firestore).
- **AI Engine:** Google Gemini AI (via `@google/genai`).

## 🚀 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`) and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Firebase Configuration
The app expects a `firebase-applet-config.json` in the root directory with your Firebase project credentials:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "...",
  "firestoreDatabaseId": "..."
}
```

### 3. Installation
Install the dependencies:
```bash
npm install
```

### 4. Running the App
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📱 Usage Guide

1. **Home Dashboard:** View current weather and get a quick AI tip for the day.
2. **Planting Schedule:** Click "Generate Schedule" on the dashboard, enter your crop and location, and receive a tailored planting guide.
3. **Report Issues:** Go to the "Issues" tab to report crop problems. You can upload a photo for a more accurate AI diagnosis.
4. **Manage Tasks:** (Requires Sign-in) Use the "Tasks" tab to create and track your daily farming activities.
5. **Preferences:** Access the "Profile" tab (or the settings icon on the dashboard for guests) to change your language and measurement units.

## 🌍 Localization
AgriPulse AI is built to be accessible. It uses AI to translate advice into the farmer's preferred language, ensuring that technical agricultural knowledge is available to everyone, regardless of their primary language.

## 📶 Offline Capability
The app uses **Firestore Offline Persistence**. Data you view or create while online is cached locally. If you lose your connection:
- You can still view previously loaded tasks and issues.
- New tasks or issues created while offline will be queued and automatically synced once you reconnect.
- A visual indicator in the header shows your current connection status.

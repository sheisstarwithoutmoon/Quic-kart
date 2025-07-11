# Quickart - Your AI-Powered Neighborhood Storefront

No Blinkit? No BigBasket? No Zepto? No PharmEasy? in your local area Quickart is to the rescue no profitable model (for developer, free to use, no platform charges) just by community to community for locals.
As in India there are so many places where all these apps can't reach but public is willing to pay.
Whether you're a student ordering late-night snacks, a local store owner wanting to reach more customers, or a delivery partner working within campus – Quickart bridges the gap between **local demand and instant supply**.

Quickart is a full-stack e-commerce application built with Next.js and Firebase, designed to bring local stores online. It features a modern, responsive interface and leverages Google's Gemini AI through Genkit for intelligent features like an AI shopping assistant, order summaries, and product recommendations.

![Quickart Homepage](https://quic-kart-ct66za81z-vanyas-projects-ed11fcee.vercel.app/)

## ⚙️ Key Features

### 🛍️ Local Store & Product Browsing
- Browse nearby medical stores or grocery stores curated specifically for your area.
- Clean and modern interface to view product details and availability.

### 🛒 Smart Shopping Cart
- Add, update, and remove items easily.
- Handles items from multiple stores efficiently.

### 📝 Upload Prescription of your doctor and just in one click your medicines will be at your doorstep in coming 2 hrs

### 📸 Visual search the products

### 🔐 Secure Authentication
- Role-based login system for:
  - 🧑‍🎓 Students / Consumers
  - 🏪 Store Owners
  - 🚴 Delivery Partners
- Authentication managed via **Firebase Auth**.

### 🤖 AI Shopping Assistant
- Chat with a built-in AI assistant powered by **Genkit** and **Gemini**.
- Ask product-related questions or get help finding items instantly.

### 📸 AI Tools for Convenience
- **Prescription Reader**: Upload prescriptions and auto-extract medicine names and doses.
- **Visual Search**: Upload a product image and let the AI find similar items in local stores.

### 🧠 Product Recommendations
- Get intelligent, AI-powered suggestions for related products on product pages.

### 📝 Order Summaries
- Each order includes a **WhatsApp-style summary** with clear, readable itemization.

### 📊 Dashboards for Every Role
- **Consumers**: View order history and current status.
- **Store Owners**: Manage inventory, live orders, and assign deliveries.
- **Delivery Personnel**: Access assigned deliveries, customer details, and OTP verification tools.

### 🚚 End-to-End Order Management
- Real-time tracking from order placement to delivery.
- OTP-based delivery verification ensures secure hand-offs.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 
- **AI/Generative**: [Google AI Studio (Gemini)](https://ai.google.dev/) & [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & DB**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **State Management**: React Context API (for Cart & Auth)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm` or `yarn`

### Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - Create a **Web App** in your Firebase project settings.
    - Copy your Firebase configuration credentials.
    - Create a `.env` file in the root of your project and add your Firebase credentials:
      ```env
      NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
      NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
      ```
    - In the Firebase Console, go to **Build > Firestore Database** and create a database.
    - Go to **Build > Authentication** and enable the **Email/Password** sign-in method.

4.  **Set up Google AI (for Genkit):**
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to generate an API key.
    - Add this key to your `.env` file:
      ```env
      GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY
      ```

5.  **Run the Genkit developer UI (in a separate terminal):**
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit development server, usually on `http://localhost:4000`.

6.  **Run the Next.js development server:**
    ```sh
    npm run dev
    ```

Open [https://quic-kart-ct66za81z-vanyas-projects-ed11fcee.vercel.app/](https://quic-kart-ct66za81z-vanyas-projects-ed11fcee.vercel.app/) with your browser to see the result.

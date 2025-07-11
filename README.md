# Quickart - Your AI-Powered Neighborhood Storefront

Quickart is a full-stack e-commerce application built with Next.js and Firebase, designed to bring local stores online. It features a modern, responsive interface and leverages Google's Gemini AI through Genkit for intelligent features like an AI shopping assistant, order summaries, and product recommendations.

![Quickart Homepage](https://quic-kart-ct66za81z-vanyas-projects-ed11fcee.vercel.app/)

## Key Features

- **🛍️ Store & Product Browsing**: Users can browse different stores and view product details in a clean, modern interface.
- **🛒 Shopping Cart**: A fully functional cart to add, update, and remove items. It smartly handles items from different stores.
- **🔐 User Authentication**: Secure sign-up and login for consumers, store owners, and delivery personnel using Firebase Auth.
- **🤖 AI Shopping Assistant**: A conversational chatbot powered by Genkit and Gemini that can search for products and answer customer questions in real-time.
- **📸 AI-Powered Search & Data Extraction**:
    - **Visual Search**: Upload a product image and have the AI identify it and find it in the store.
    - **Prescription Upload**: Automatically extract medicine details from an uploaded prescription image.
- **🧠 Smart Recommendations**: AI-driven suggestions for similar products on product detail pages.
- **📝 AI Order Summaries**: Generates a concise, text-message-style summary of an order upon confirmation.
- ** dashboards**: Tailored dashboard experiences for different user roles:
    - **Consumers**: View order history and status.
    - **Store Owners**: Manage inventory, view live orders, and assign deliveries.
    - **Delivery Personnel**: View assigned deliveries, see customer details, and verify completion with an OTP.
- **🚚 Order Management**: A complete order lifecycle from placement to delivery, with real-time status updates and OTP verification for secure hand-offs.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
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

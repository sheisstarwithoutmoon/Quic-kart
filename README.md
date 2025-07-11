@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 98%; /* Clean, light background */
    --foreground: 240 10% 3.9%; /* Slightly muted dark gray */
    --card: 0 0% 100%; /* White cards */
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%; /* White popovers */
    --popover-foreground: 240 10% 3.9%;
    --primary: 142.1 76.2% 36.3%; /* Fresh green */
    --primary-foreground: 355.7 100% 97.3%; /* Off-white for text on primary */
    --secondary: 210 20% 98%; /* Very light gray/off-white secondary */
    --secondary-foreground: 220.9 39.3% 11%; /* Darker text on secondary */
    --muted: 210 20% 98%; /* Matching secondary for muted elements */
    --muted-foreground: 220 8.9% 46.1%; /* Muted gray for muted text */
    --accent: 210 40% 96.1%; /* Light blue-gray for accents */
    --accent-foreground: 222.2 47.4% 11.2%; /* Darker text on accent */
    --destructive: 0 84.2% 60.2%; /* Red for destructive actions */
    --destructive-foreground: 210 20% 98%; /* Off-white for text on destructive */
    --border: 214.3 31.8% 91.4%; /* Light gray border */
    --input: 214.3 31.8% 91.4%; /* Matching light gray input border */
    --ring: 142.1 76.2% 36.3%; /* Ring color matching primary */
    --radius: 0.8rem; /* Keeping the existing radius */
    --chart-1: 12 76% 61%; /* Keeping existing chart colors for now */
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    /* Adjusting sidebar colors for better contrast and theme consistency */
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 142.1 76.2% 36.3%;
    --sidebar-primary-foreground: 355.7 100% 97.3%;
    --sidebar-accent: 210 40% 96.1%;
    --sidebar-accent-foreground: 222.2 47.4% 11.2%;
    --sidebar-border: 214.3 31.8% 91.4%;
    --sidebar-ring: 142.1 76.2% 36.3%;
  }

  .dark {
    --background: 20 14.3% 4.5%; /* Dark background */
    --foreground: 0 0% 95.5%; /* Light foreground */
    --card: 24 9.8% 10%; /* Slightly lighter dark for cards */
    --card-foreground: 0 0% 95.5%;
    --popover: 20 14.3% 4.5%; /* Dark popover */
    --popover-foreground: 0 0% 95.5%;
    --primary: 142.1 76.2% 36.3%; /* Keeping the green primary */
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 24 9.8% 10%; /* Slightly lighter dark for secondary */
    --secondary-foreground: 0 0% 95.5%;
    --muted: 24 9.8% 10%; /* Matching secondary for muted */
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%; /* Darker accent */
    --accent-foreground: 0 0% 95.5%;
    --destructive: 0 62.8% 30.6%; /* Darker destructive */
    --destructive-foreground: 0 0% 95.5%;
    --border: 24 9.8% 10%; /* Dark border */
    --input: 24 9.8% 10%; /* Dark input border */
    --ring: 142.1 76.2% 36.3%; /* Ring color matching primary */
    --chart-1: 220 70% 50%; /* Keeping existing dark mode chart colors */
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    /* Adjusting sidebar colors for better contrast and theme consistency in dark mode */
    --sidebar-background: 20 14.3% 4.5%;
    --sidebar-foreground: 0 0% 95.5%;
    --sidebar-primary: 142.1 76.2% 36.3%;
    --sidebar-primary-foreground: 355.7 100% 97.3%;
    --sidebar-accent: 12 6.5% 15.1%;
    --sidebar-accent-foreground: 0 0% 95.5%;
    --sidebar-border: 24 9.8% 10%;
    --sidebar-ring: 142.1 76.2% 36.3%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

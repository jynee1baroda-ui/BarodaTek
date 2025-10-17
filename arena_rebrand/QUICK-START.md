# 🚀 Quick Start - Arena Rebrand

## Step 1: Initialize React + Vite Project
```powershell
cd arena_rebrand
npm create vite@latest arena-app -- --template react
cd arena-app
npm install
```

## Step 2: Install Dependencies
```powershell
# Tailwind CSS for styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Framer Motion for animations
npm install framer-motion

# Lucide React for icons
npm install lucide-react
```

## Step 3: Configure Tailwind
Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena-black': '#0a0a0a',
        'arena-red': '#FF0033',
        'arena-red-glow': '#FF336680',
        'arena-dark-gray': '#1a1a1a',
        'arena-mid-gray': '#2a2a2a',
        'arena-light-gray': '#a0a0a0',
        'arena-white': '#f5f5f5',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Orbitron', 'Poppins', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

## Step 4: Update CSS Entry Point
Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-arena-black text-arena-white font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading font-bold;
  }
}

@layer components {
  .arena-btn {
    @apply px-6 py-3 rounded-lg font-semibold transition-all duration-200;
    @apply hover:scale-105 active:scale-95;
  }
  
  .arena-btn-primary {
    @apply bg-arena-red text-white;
    @apply hover:bg-arena-red-dark hover:shadow-[0_0_20px_rgba(255,0,51,0.5)];
  }
  
  .arena-card {
    @apply bg-arena-dark-gray border border-arena-mid-gray rounded-xl p-6;
    @apply transition-all duration-300;
    @apply hover:border-arena-red hover:shadow-[0_0_30px_rgba(255,0,51,0.3)];
  }
  
  .glow-text-red {
    @apply text-arena-red;
    text-shadow: 0 0 20px rgba(255, 0, 51, 0.6);
  }
}
```

## Step 5: Create Hero Component
Create `src/components/Hero.jsx`:
```jsx
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,51,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,51,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Gamepad2 className="w-20 h-20 mx-auto mb-6 text-arena-red" />
          
          <h1 className="text-6xl md:text-8xl font-heading font-black mb-6 glow-text-red">
            ENTER THE ARENA
          </h1>
          
          <p className="text-xl md:text-2xl text-arena-light-gray mb-10 max-w-2xl mx-auto">
            Where Code Meets Competition
          </p>
          
          <motion.button
            className="arena-btn arena-btn-primary text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
```

## Step 6: Update App.jsx
Edit `src/App.jsx`:
```jsx
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-arena-black">
      <Hero />
      {/* More sections coming soon */}
    </div>
  );
}

export default App;
```

## Step 7: Run Development Server
```powershell
npm run dev
```
Open browser to http://localhost:5173

## Step 8: Build Components
Create these files in `src/components/`:
- `ServiceCards.jsx` - Feature showcase
- `ArenaGames.jsx` - Game demos
- `Testimonials.jsx` - Client feedback
- `Footer.jsx` - Site footer

## Step 9: Add Google Fonts
Edit `index.html` in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@400;700;900&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

## Step 10: Build for Production
```powershell
npm run build
```
Output will be in `dist/` folder.

## Next Steps
1. ✅ Complete all page components
2. ✅ Test responsive design on mobile/tablet
3. ✅ Verify accessibility (contrast, keyboard nav)
4. ✅ Optimize images and assets
5. ✅ Copy to main project or deploy separately

---

**Ready to dominate? Let's go! 💪🔥**

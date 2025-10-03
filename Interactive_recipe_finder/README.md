# 🍛 RasoiSmart - Interactive Indian Recipe Finder & Food Waste Reducer

> **Web Development Internship Project**  
> Built with semantic **HTML5**, modern **Vanilla CSS3**, and **ES6+ JavaScript**. Pure client-side, zero external framework dependencies, and 100% offline-ready.

---

## 🌟 Overview & Problem Statement

In households, student dorms, and bachelor pads across India, millions of people face the daily question:  
***"What can I cook with whatever is left in my fridge?"***

Food often spoils and goes to waste simply because people don't know how to combine disjointed pantry items (like a single bell pepper, sour curd, leftover boiled potatoes, or stale bread) into tasty meals.

**RasoiSmart** solves this by:
1. **Allowing users to enter whatever ingredients they currently possess.**
2. **Calculating dynamic match percentages** across an extensive curated database of authentic Indian recipes.
3. **Featuring specialized "Zero-Waste Leftover Recipes"** designed specifically to repurpose day-old rice, stale bread, sour yogurt, and leftover dal.
4. **Providing an interactive hands-free cooking assistant** with a built-in step timer and audio alerts.

---

## ✨ Key Features

### 1. 🔍 Smart Ingredient Matching Engine
- **Ingredient Stemming & Desi Synonyms**: Understands Indian culinary terms seamlessly (e.g. *aloo/potato*, *pyaz/kanda/onion*, *dahi/curd*, *atta/wheat flour*, *poha/avalakki*, *chawal/rice*).
- **Match Score & Status Pills**:
  - 🟢 **High Match (≥ 75%)**: Ready to cook! You have virtually everything.
  - 🟡 **Medium Match (40% - 74%)**: Missing 1-2 items (with easy substitutions provided).
  - ⚪ **Low Match (< 40%)**: Needs grocery trip.
- **⚡ On-Page Quick-Tap Ingredient Picker**: Clickable category tabs (*⭐ Popular, 🥦 Veggies, 🧀 Dairy & Protein, 🌾 Grains & Flours, 🟡 Dals, 🌿 Aromatics*) with toggle checkmarks so users can select ingredients on the fly without typing!
- **🍽️ "Select Food by Key Ingredient" Strip**: Instantly filter Indian dishes around star ingredients (*🧀 Paneer Dishes, 🥔 Aloo / Potato, 🍚 Rice Specials, 🟡 Dal & Lentils, 🫘 Chole & Rajma, 🍞 Bread Snacks, 🥚 Egg Dishes, 🍗 Chicken, 🥣 South Tiffin & Poha, 🥬 Palak / Greens*).
- **Quick Pantry Presets**: One-click loaders for *Indian Essentials*, *Bachelor/Student*, *Vegetarian Classics*, and *South Indian Stash*.
- **Categorized Pantry Selector**: Interactive modal to browse items by category.

### 2. 🍲 40+ Rich Authentic Indian Recipes
- Spans diverse regions: **North Indian**, **South Indian**, **Maharashtrian**, **Gujarati**, **Hyderabadi**, **Indo-Chinese**, and **Street Food**.
- Full dietary classification: Pure Vegetarian (🌱), Vegan (🌿), and Non-Vegetarian (🍗).
- Includes prep times, cook times, difficulty levels, and calorie estimates.

### 3. 🥘 Dynamic Serving Scaler (Food Waste Prevention)
- In the Recipe Detail view, adjust servings with `-` and `+` buttons.
- Quantities re-calculate in real time, preventing people from over-preparing and having to discard surplus food.

### 4. ♻️ "Leftover Heroes" & Zero-Waste Tips
- Dedicated section showing how to turn:
  - **Day-Old Cooked Rice** ➔ Tangy Lemon Rice, Mumbai Tawa Pulao, Curd Rice.
  - **Stale / Day-Old Bread** ➔ Spicy Bread Upma, Crispy Bread Pakora.
  - **Sour Curd (Khatta Dahi)** ➔ Punjabi Kadhi Pakora, Soft Gujarati Thepla.
  - **Boiled Potatoes** ➔ Dhaba Aloo Jeera, Amritsari Paratha, Bhel Puri.
- Every recipe includes a **"Zero-Food-Waste Rasoi Tip"** and a **"Chef's Desi Secret"**.

### 5. 💡 Indian Kitchen Substitutions Guide
- Interactive modal table explaining what to use when an ingredient is missing (e.g., using milk + lemon instead of curd, cashew paste for heavy cream, amchur for tamarind, or hing for garlic/onion in Jain cooking).

### 6. 👨‍🍳 Guided Cooking Mode with Audio-Beep Timer
- Fullscreen, distraction-free view with large typography.
- Step progress bar and previous/next navigation.
- **Interactive Cooking Timer** with 2m, 5m, 10m, and 15m presets.
- **Web Audio API**: Plays a cheerful three-tone chime when the timer finishes so you never burn your tadka!

### 7. 🛒 Smart Missing Grocery List
- Missing ingredients can be added to the shopping list with one click.
- Check off items as you buy them.
- **WhatsApp/SMS Export**: Formats the list with emojis and copies it to your clipboard with a single tap.

### 8. 🎨 Modern Design & Dark/Light Mode
- Palette inspired by traditional Indian spices: Saffron (`#e65100`), Turmeric Gold (`#f59e0b`), Cardamom Green (`#15803d`), and Spiced Charcoal.
- Smooth CSS variables and glassmorphism styling.
- Remembers theme and pantry state using the browser's `localStorage` API.
- Print-friendly stylesheet for printing recipes cleanly.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Structure** | Semantic HTML5 | Accessible, SEO-friendly markup with ARIA roles |
| **Styling** | Vanilla CSS3 | CSS custom properties, Grid, Flexbox, Glassmorphism, Print media |
| **Logic** | Modern ES6+ JavaScript | Matching algorithms, DOM manipulation, State management |
| **Audio** | Web Audio API | Pure programmatic sound synthesizer for cooking timer chime |
| **Storage** | Web Storage API | Saves favorites, pantry inventory, and shopping list in `localStorage` |
| **Fonts** | Google Fonts | *Plus Jakarta Sans* & *Rozha One* |

---

## 📁 Project Structure

```text
Interactive_recipe_finder/
│
├── index.html        # Main HTML5 application structure & modal templates
├── style.css         # Modern responsive design system, dark mode & animations
├── recipes.js        # Curated dataset of 40 Indian recipes, substitutions & presets
├── script.js         # Matching engine, serving scaler, timer & UI state controller
└── README.md         # Internship project documentation & user guide
```

---

## 🚀 How to Run Locally

Because this project is built using vanilla web technologies, **no build step or package installation (`npm install`) is required**.

### Option 1: Direct File Opening
Double-click `index.html` or right-click and choose **Open with Browser** (Chrome, Edge, Firefox, Safari).

### Option 2: Using Python's Built-In HTTP Server
```bash
# Navigate to the project directory
cd Interactive_recipe_finder

# Start a lightweight local server
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: VS Code Live Server
Open the folder in Visual Studio Code, right-click `index.html`, and select **"Open with Live Server"**.

---

## 💡 Key Learnings & Internship Takeaways
1. **Algorithmic State Matching**: Engineered an ingredient normalization pipeline handling Indian names, singular/plural variations, and fuzzy matching.
2. **Accessible UI/UX Design**: Structured dialogs with keyboard accessibility, ARIA labels, responsive typography, and mobile-first touch targets.
3. **Performance Optimization**: Zero framework overhead ensures instant sub-second load times and 60 FPS transitions.
4. **Impact-Driven Problem Solving**: Bridged software engineering with a real-world social impact—reducing domestic food waste and encouraging sustainable cooking.

---

*Crafted with ❤️ for the Web Development Internship Project.*

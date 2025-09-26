// ============================================================================
// RasoiSmart - Smart Indian Recipe Finder & Food Waste Reducer
// Interactive Logic, Smart Ingredient Matching Engine & Cooking Assistant
// ============================================================================

(function () {
  'use strict';

  // State Management
  const state = {
    selectedIngredients: new Set(),
    favorites: new Set(JSON.parse(localStorage.getItem('rasoi_favorites') || '[]')),
    shoppingList: JSON.parse(localStorage.getItem('rasoi_shopping') || '[]'),
    activeDiet: 'all',
    activeMeal: 'all',
    activeSort: 'match',
    onlyReadyToCook: false,
    viewMode: 'all', // 'all' or 'favorites'
    activeKeyFood: 'all', // Filter food by key star ingredient
    pickerCategory: 'popular', // Category for on-page ingredient picker
    currentRecipe: null,
    currentServings: 4,
    guidedStepIndex: 0,
    timerInterval: null,
    timerSecondsLeft: 0,
    isTimerRunning: false,
    theme: localStorage.getItem('rasoi_theme') || 'light'
  };

  // Indian Culinary Synonyms & Normalization Dictionary
  const INGREDIENT_SYNONYMS = {
    'aloo': 'potato',
    'alu': 'potato',
    'potatoes': 'potato',
    'pyaz': 'onion',
    'pyaaz': 'onion',
    'kanda': 'onion',
    'onions': 'onion',
    'tamatar': 'tomato',
    'tomatoes': 'tomato',
    'adrak': 'ginger',
    'lahsun': 'garlic',
    'lasun': 'garlic',
    'dahi': 'curd',
    'yogurt': 'curd',
    'yoghurt': 'curd',
    'paneer': 'paneer',
    'cottage cheese': 'paneer',
    'atta': 'wheat flour',
    'gehu': 'wheat flour',
    'besan': 'besan',
    'gram flour': 'besan',
    'chickpea flour': 'besan',
    'suji': 'suji',
    'sooji': 'suji',
    'rava': 'suji',
    'semolina': 'suji',
    'poha': 'poha',
    'chivda': 'poha',
    'avalakki': 'poha',
    'flattened rice': 'poha',
    'chawal': 'rice',
    'cooked rice': 'cooked rice',
    'leftover rice': 'cooked rice',
    'dosa batter': 'dosa batter',
    'idli batter': 'idli batter',
    'mirchi': 'green chilli',
    'green chillies': 'green chilli',
    'green chili': 'green chilli',
    'hari mirch': 'green chilli',
    'chilli': 'green chilli',
    'eggs': 'egg',
    'anda': 'egg',
    'palak': 'spinach',
    'gobi': 'cauliflower',
    'phool gobi': 'cauliflower',
    'matar': 'green peas',
    'peas': 'green peas',
    'shimla mirch': 'capsicum',
    'bell pepper': 'capsicum',
    'murmura': 'puffed rice',
    'kurmura': 'puffed rice',
    'sev': 'sev',
    'makhan': 'butter',
    'makhani': 'butter',
    'toor dal': 'toor dal',
    'arhar dal': 'toor dal',
    'yellow dal': 'toor dal',
    'urad dal': 'urad dal',
    'moong dal': 'moong dal',
    'rajma': 'rajma',
    'kidney beans': 'rajma',
    'chole': 'chickpeas',
    'chana': 'chickpeas',
    'garbanzo': 'chickpeas',
    'methi': 'methi',
    'fenugreek': 'methi',
    'pav': 'pav',
    'bread': 'bread',
    'bread slices': 'bread',
    'chicken': 'chicken',
    'murgh': 'chicken',
    'baingan': 'eggplant',
    'brinjal': 'eggplant',
    'aubergine': 'eggplant',
    'curry leaves': 'curry leaves',
    'kadi patta': 'curry leaves',
    'peanuts': 'peanuts',
    'moongphali': 'peanuts',
    'kaju': 'cashew',
    'cashews': 'cashew',
    'dhania': 'coriander',
    'cilantro': 'coriander'
  };

  // DOM Elements Cache
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle-btn'),
    // Ingredient Search & Station
    ingredientInput: document.getElementById('ingredient-input'),
    btnAddIngredient: document.getElementById('btn-add-ingredient'),
    autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
    selectedShelf: document.getElementById('selected-shelf'),
    shelfPlaceholder: document.getElementById('shelf-placeholder'),
    pantryPresetsContainer: document.getElementById('pantry-presets'),
    btnOpenPantryModal: document.getElementById('btn-open-pantry-modal'),
    // Navigation / View switches
    btnNavFavorites: document.getElementById('nav-favorites-btn'),
    btnNavShopping: document.getElementById('nav-shopping-btn'),
    btnNavSubstitutions: document.getElementById('nav-substitutions-btn'),
    favCountBadge: document.getElementById('fav-count-badge'),
    shoppingCountBadge: document.getElementById('shopping-count-badge'),
    // Filters & Sorting
    filterDietChips: document.querySelectorAll('.filter-chip[data-diet]'),
    sortSelect: document.getElementById('sort-select'),
    mealSelect: document.getElementById('meal-select'),
    readyOnlyToggle: document.getElementById('ready-only-toggle'),
    // Grid & Results
    recipesGrid: document.getElementById('recipes-grid'),
    resultsCount: document.getElementById('results-count'),
    // Modals
    recipeModal: document.getElementById('recipe-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    guidedModal: document.getElementById('guided-modal'),
    guidedCloseBtn: document.getElementById('guided-close-btn'),
    pantryModal: document.getElementById('pantry-modal'),
    pantryModalCloseBtn: document.getElementById('pantry-close-btn'),
    shoppingModal: document.getElementById('shopping-modal'),
    shoppingCloseBtn: document.getElementById('shopping-close-btn'),
    substitutionsModal: document.getElementById('substitutions-modal'),
    subsCloseBtn: document.getElementById('subs-close-btn'),
    // Guided Cooking Elements
    guidedStepText: document.getElementById('guided-step-text'),
    guidedStepBadge: document.getElementById('guided-step-badge'),
    guidedProgressFill: document.getElementById('guided-progress-fill'),
    btnGuidedPrev: document.getElementById('btn-guided-prev'),
    btnGuidedNext: document.getElementById('btn-guided-next'),
    timerDigits: document.getElementById('timer-digits'),
    btnTimerToggle: document.getElementById('btn-timer-toggle'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    // Shopping List Elements
    shoppingItemsContainer: document.getElementById('shopping-items-container'),
    btnCopyShoppingList: document.getElementById('btn-copy-shopping-list'),
    btnClearShoppingList: document.getElementById('btn-clear-shopping-list'),
    // Substitutions
    subsSearchInput: document.getElementById('subs-search-input'),
    subsTableBody: document.getElementById('subs-table-body'),
    // Leftover Cards
    leftoverCardsContainer: document.getElementById('leftover-cards-container'),
    // Toast Container
    toastContainer: document.getElementById('toast-container'),
    // On-page Ingredient Picker & Key Food Selector
    pickerCategoryTabs: document.getElementById('picker-category-tabs'),
    pickerChipsGrid: document.getElementById('picker-chips-grid'),
    keyFoodChipsWrapper: document.getElementById('key-food-chips')
  };

  // Pre-configured Quick-Tap Ingredients with Desi Emojis
  const QUICK_PICKER_CATEGORIES = {
    popular: [
      { id: 'potato', label: '🥔 Potato (Aloo)' },
      { id: 'onion', label: '🧅 Onion (Pyaz)' },
      { id: 'tomato', label: '🍅 Tomato (Tamatar)' },
      { id: 'garlic', label: '🧄 Garlic (Lahsun)' },
      { id: 'ginger', label: '🫚 Ginger (Adrak)' },
      { id: 'green chilli', label: '🌶️ Green Chilli' },
      { id: 'paneer', label: '🧀 Paneer' },
      { id: 'curd', label: '🥛 Curd (Dahi)' },
      { id: 'rice', label: '🍚 Rice (Chawal)' },
      { id: 'toor dal', label: '🟡 Toor Dal' },
      { id: 'wheat flour', label: '🌾 Atta' },
      { id: 'besan', label: '🟡 Besan' },
      { id: 'bread', label: '🍞 Bread' },
      { id: 'egg', label: '🥚 Egg' },
      { id: 'poha', label: '🥣 Poha' },
      { id: 'butter', label: '🧈 Butter' }
    ],
    veggies: [
      { id: 'potato', label: '🥔 Potato' },
      { id: 'onion', label: '🧅 Onion' },
      { id: 'tomato', label: '🍅 Tomato' },
      { id: 'spinach', label: '🥬 Palak (Spinach)' },
      { id: 'cauliflower', label: '🥦 Gobi' },
      { id: 'green peas', label: '🫛 Green Peas' },
      { id: 'capsicum', label: '🫑 Capsicum' },
      { id: 'eggplant', label: '🍆 Baingan' },
      { id: 'carrot', label: '🥕 Carrot' },
      { id: 'cabbage', label: '🥬 Cabbage' },
      { id: 'green chilli', label: '🌶️ Green Chilli' },
      { id: 'ginger', label: '🫚 Ginger' },
      { id: 'garlic', label: '🧄 Garlic' }
    ],
    dairy: [
      { id: 'paneer', label: '🧀 Paneer' },
      { id: 'curd', label: '🥛 Curd (Dahi)' },
      { id: 'butter', label: '🧈 Butter' },
      { id: 'ghee', label: '🫙 Ghee' },
      { id: 'milk', label: '🥛 Milk' },
      { id: 'cream', label: '🥣 Malai / Cream' },
      { id: 'egg', label: '🥚 Egg' },
      { id: 'chicken', label: '🍗 Chicken' }
    ],
    grains: [
      { id: 'rice', label: '🍚 Rice' },
      { id: 'cooked rice', label: '🍚 Leftover Rice' },
      { id: 'wheat flour', label: '🌾 Wheat Flour (Atta)' },
      { id: 'besan', label: '🟡 Besan (Gram Flour)' },
      { id: 'suji', label: '🥞 Suji / Rava' },
      { id: 'poha', label: '🥣 Poha' },
      { id: 'bread', label: '🍞 Bread' },
      { id: 'pav', label: '🥖 Pav Buns' },
      { id: 'dosa batter', label: '🥟 Dosa Batter' },
      { id: 'noodles', label: '🍜 Hakka Noodles' },
      { id: 'puffed rice', label: '🍿 Puffed Rice (Murmura)' }
    ],
    dals: [
      { id: 'toor dal', label: '🟡 Toor Dal' },
      { id: 'moong dal', label: '🟢 Moong Dal' },
      { id: 'urad dal', label: '⚪ Urad Dal' },
      { id: 'chickpeas', label: '🟤 Chole / Chickpeas' },
      { id: 'rajma', label: '🔴 Rajma (Kidney Beans)' }
    ],
    aromatics: [
      { id: 'curry leaves', label: '🌿 Curry Leaves' },
      { id: 'lemon', label: '🍋 Lemon' },
      { id: 'peanuts', label: '🥜 Peanuts' },
      { id: 'cashew', label: '🌰 Cashew (Kaju)' },
      { id: 'coconut', label: '🥥 Coconut' },
      { id: 'methi', label: '🌱 Fresh Methi' }
    ]
  };

  // Extract unique ingredient list for autocomplete & categorized pantry
  const ALL_INGREDIENTS = extractAllIngredients();

  // Initialization
  function init() {
    applyTheme(state.theme);
    renderPantryPresets();
    renderCategorizedPantryModal();
    renderOnPageIngredientPicker();
    renderLeftoverSection();
    renderSubstitutionsTable();
    updateBadges();

    // Load sample starter ingredients if first time visiting
    const savedIngredients = localStorage.getItem('rasoi_pantry');
    if (savedIngredients) {
      try {
        const parsed = JSON.parse(savedIngredients);
        parsed.forEach(ing => state.selectedIngredients.add(normalizeIngredient(ing)));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default initial pantry essentials so user sees instant results
      ['onion', 'tomato', 'potato', 'ginger', 'garlic'].forEach(i => state.selectedIngredients.add(i));
    }

    renderSelectedShelf();
    calculateAndRenderRecipes();
    bindEventListeners();
  }

  // Normalize ingredient text (handle plural, lowercase, Indian names)
  function normalizeIngredient(raw) {
    if (!raw) return '';
    let cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (INGREDIENT_SYNONYMS[cleaned]) {
      return INGREDIENT_SYNONYMS[cleaned];
    }
    // Remove plural 's' or 'es'
    if (cleaned.endsWith('es') && cleaned.length > 3) {
      const singular = cleaned.slice(0, -2);
      if (INGREDIENT_SYNONYMS[singular]) return INGREDIENT_SYNONYMS[singular];
    }
    if (cleaned.endsWith('s') && cleaned.length > 2) {
      const singular = cleaned.slice(0, -1);
      if (INGREDIENT_SYNONYMS[singular]) return INGREDIENT_SYNONYMS[singular];
    }
    return cleaned;
  }

  // Extract unique list of all ingredients across RECIPES_DATA
  function extractAllIngredients() {
    const set = new Set();
    RECIPES_DATA.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        set.add(normalizeIngredient(ing.item));
      });
    });
    return Array.from(set).sort();
  }

  // ==========================================================================
  // Smart Recipe Matching Engine
  // ==========================================================================
  function matchRecipe(recipe) {
    const userIngredients = state.selectedIngredients;
    const recipeIngredients = recipe.ingredients.map(i => ({
      ...i,
      normalized: normalizeIngredient(i.item)
    }));

    const matched = [];
    const missing = [];

    recipeIngredients.forEach(ing => {
      let isMatched = false;

      // Direct match
      if (userIngredients.has(ing.normalized)) {
        isMatched = true;
      } else {
        // Fuzzy substring check (e.g., 'rice' matches 'cooked rice', 'wheat' matches 'wheat flour')
        for (const userIng of userIngredients) {
          if (ing.normalized.includes(userIng) || userIng.includes(ing.normalized)) {
            isMatched = true;
            break;
          }
        }
      }

      if (isMatched) {
        matched.push(ing);
      } else {
        missing.push(ing);
      }
    });

    const totalCount = recipeIngredients.length;
    const matchPercentage = totalCount === 0 ? 0 : Math.round((matched.length / totalCount) * 100);

    return {
      recipe,
      matched,
      missing,
      matchPercentage,
      totalCount
    };
  }

  // Filter and Sort Recipes
  function getFilteredAndSortedRecipes() {
    let results = RECIPES_DATA.map(r => matchRecipe(r));

    // View Mode: Favorites only?
    if (state.viewMode === 'favorites') {
      results = results.filter(item => state.favorites.has(item.recipe.id));
    }

    // Dietary Filter
    if (state.activeDiet !== 'all') {
      results = results.filter(item => item.recipe.diet === state.activeDiet);
    }

    // Meal Type Filter
    if (state.activeMeal !== 'all') {
      results = results.filter(item => item.recipe.mealType === state.activeMeal);
    }

    // Key Star Ingredient / Food Filter (Select food based on ingredients)
    if (state.activeKeyFood !== 'all') {
      results = results.filter(item => {
        const r = item.recipe;
        const key = state.activeKeyFood;
        const title = r.title.toLowerCase();
        const hasIng = r.ingredients.some(i => i.item.toLowerCase().includes(key));
        
        if (key === 'paneer') return hasIng || title.includes('paneer');
        if (key === 'potato') return hasIng || r.ingredients.some(i => i.item.includes('potato')) || title.includes('aloo');
        if (key === 'rice') return hasIng || r.ingredients.some(i => i.item.includes('rice')) || title.includes('rice') || title.includes('biryani') || title.includes('pulao') || title.includes('khichdi');
        if (key === 'dal') return hasIng || r.ingredients.some(i => i.item.includes('dal')) || title.includes('dal') || title.includes('sambar') || title.includes('khichdi') || title.includes('kadhi');
        if (key === 'chickpeas') return hasIng || r.ingredients.some(i => i.item.includes('chickpea') || i.item.includes('rajma') || i.item.includes('chole')) || title.includes('chole') || title.includes('rajma');
        if (key === 'bread') return hasIng || r.ingredients.some(i => i.item.includes('bread') || i.item.includes('pav')) || title.includes('bread') || title.includes('pav');
        if (key === 'egg') return hasIng || r.ingredients.some(i => i.item.includes('egg')) || title.includes('egg') || title.includes('anda');
        if (key === 'chicken') return hasIng || r.ingredients.some(i => i.item.includes('chicken')) || title.includes('chicken');
        if (key === 'breakfast') return r.mealType === 'breakfast' || r.ingredients.some(i => i.item.includes('poha') || i.item.includes('suji') || i.item.includes('dosa') || i.item.includes('idli'));
        if (key === 'spinach') return hasIng || r.ingredients.some(i => i.item.includes('spinach') || i.item.includes('methi')) || title.includes('palak');
        return hasIng;
      });
    }

    // Ready to cook toggle (>= 70% match)
    if (state.onlyReadyToCook) {
      results = results.filter(item => item.matchPercentage >= 70);
    }

    // Sorting
    results.sort((a, b) => {
      if (state.activeSort === 'match') {
        return b.matchPercentage - a.matchPercentage;
      }
      if (state.activeSort === 'time') {
        return (a.recipe.prepTime + a.recipe.cookTime) - (b.recipe.prepTime + b.recipe.cookTime);
      }
      if (state.activeSort === 'calories') {
        return a.recipe.calories - b.recipe.calories;
      }
      if (state.activeSort === 'difficulty') {
        const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
        return (diffWeight[a.recipe.difficulty] || 2) - (diffWeight[b.recipe.difficulty] || 2);
      }
      return 0;
    });

    return results;
  }

  // Calculate and Render Recipe Cards
  function calculateAndRenderRecipes() {
    const results = getFilteredAndSortedRecipes();

    // Update count indicator
    if (elements.resultsCount) {
      elements.resultsCount.innerHTML = `Showing <span>${results.length}</span> ${
        state.viewMode === 'favorites' ? 'Saved' : 'Matching'
      } Indian Recipes`;
    }

    if (!elements.recipesGrid) return;

    if (results.length === 0) {
      elements.recipesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🍲</div>
          <h3>No Recipes Found</h3>
          <p>
            ${
              state.viewMode === 'favorites'
                ? "You haven't bookmarked any recipes yet! Tap the heart icon on any recipe card to save it."
                : 'Try adding more everyday ingredients like onion, tomato, potato, or curd to discover wonderful dishes!'
            }
          </p>
          ${
            state.viewMode === 'favorites'
              ? `<button class="btn-primary-action" id="btn-browse-all" style="max-width:240px; margin:0 auto;">Explore All Recipes</button>`
              : `<button class="btn-primary-action" id="btn-reset-pantry" style="max-width:240px; margin:0 auto;">Load Indian Essentials</button>`
          }
        </div>
      `;

      const btnBrowseAll = document.getElementById('btn-browse-all');
      if (btnBrowseAll) {
        btnBrowseAll.addEventListener('click', () => {
          state.viewMode = 'all';
          updateBadges();
          calculateAndRenderRecipes();
        });
      }

      const btnResetPantry = document.getElementById('btn-reset-pantry');
      if (btnResetPantry) {
        btnResetPantry.addEventListener('click', () => {
          applyPantryPreset('essentials');
        });
      }

      return;
    }

    elements.recipesGrid.innerHTML = results
      .map(({ recipe, matched, missing, matchPercentage }) => {
        const isFav = state.favorites.has(recipe.id);
        const totalTime = recipe.prepTime + recipe.cookTime;

        // Match badge class
        let matchClass = 'match-low';
        let matchIcon = '⚪';
        if (matchPercentage >= 75) {
          matchClass = 'match-high';
          matchIcon = '🟢';
        } else if (matchPercentage >= 40) {
          matchClass = 'match-med';
          matchIcon = '🟡';
        }

        // Diet badge class
        let dietClass = 'veg';
        let dietLabel = 'Veg';
        if (recipe.diet === 'vegan') {
          dietClass = 'vegan';
          dietLabel = 'Vegan';
        } else if (recipe.diet === 'non-vegetarian') {
          dietClass = 'nonveg';
          dietLabel = 'Non-Veg';
        }

        // Missing items text summary
        const missingSummary =
          missing.length === 0
            ? '🎉 You have all main ingredients!'
            : `Missing: <strong>${missing.length}</strong> (${missing
                .slice(0, 2)
                .map(m => m.item)
                .join(', ')}${missing.length > 2 ? '...' : ''})`;

        return `
        <article class="recipe-card" data-recipe-id="${recipe.id}">
          <div class="recipe-image-wrap">
            <img 
              class="recipe-img" 
              src="${recipe.image}" 
              alt="${recipe.title}" 
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'"
            />
            <div class="recipe-badges-top">
              <span class="diet-pill ${dietClass}">${dietLabel}</span>
              <button 
                class="card-fav-btn ${isFav ? 'active' : ''}" 
                title="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
                data-fav-id="${recipe.id}"
                aria-label="Bookmark Recipe"
              >
                ${isFav ? '❤️' : '🤍'}
              </button>
            </div>
            <div class="match-score-pill ${matchClass}">
              <span>${matchIcon}</span>
              <span>${matchPercentage}% Match</span>
            </div>
          </div>

          <div class="recipe-body">
            <div class="cuisine-tag">${recipe.cuisine} • ${recipe.difficulty}</div>
            <h3 class="recipe-title">${recipe.title}</h3>
            <div class="recipe-hindi-title">${recipe.hindiTitle}</div>

            <div class="recipe-meta-row">
              <span>⏱️ ${totalTime}m</span>
              <span>🔥 ${recipe.calories} kcal</span>
              <span>👥 ${recipe.servings} Servings</span>
            </div>

            <div class="card-ingredient-summary">
              <div class="summary-have">
                ✓ Have ${matched.length}/${matched.length + missing.length} items
              </div>
              <div class="summary-missing">
                ${missingSummary}
              </div>
            </div>

            <button class="card-action-btn btn-view-recipe" data-recipe-id="${recipe.id}">
              <span>View Recipe & Cook</span>
              <span>→</span>
            </button>
          </div>
        </article>
      `;
      })
      .join('');
  }

  // ==========================================================================
  // On-Page Quick Tap Ingredient Picker
  // ==========================================================================
  function renderOnPageIngredientPicker() {
    if (!elements.pickerChipsGrid) return;
    const list = QUICK_PICKER_CATEGORIES[state.pickerCategory] || QUICK_PICKER_CATEGORIES.popular;

    elements.pickerChipsGrid.innerHTML = list
      .map(item => {
        const isSelected = state.selectedIngredients.has(item.id);
        return `
          <button 
            class="picker-ing-chip ${isSelected ? 'selected' : ''}" 
            data-picker-id="${item.id}"
            type="button"
            aria-pressed="${isSelected}"
            title="${isSelected ? 'Remove from pantry' : 'Add to pantry'}"
          >
            <span>${isSelected ? '✓' : '+'}</span>
            <span>${item.label}</span>
          </button>
        `;
      })
      .join('');
  }

  // ==========================================================================
  // Selected Ingredient Shelf & Input Handling
  // ==========================================================================
  function renderSelectedShelf() {
    if (!elements.selectedShelf) return;

    if (state.selectedIngredients.size === 0) {
      elements.selectedShelf.innerHTML = `
        <div class="shelf-empty-placeholder" id="shelf-placeholder">
          🛒 Your pantry shelf is empty. Type an ingredient or choose a quick preset below!
        </div>
      `;
      renderOnPageIngredientPicker();
      return;
    }

    const tagsHtml = Array.from(state.selectedIngredients)
      .map(
        ing => `
        <span class="ingredient-tag">
          <span>${capitalize(ing)}</span>
          <button class="tag-remove-btn" data-remove-ing="${ing}" title="Remove ${ing}">&times;</button>
        </span>
      `
      )
      .join('');

    elements.selectedShelf.innerHTML = `
      ${tagsHtml}
      <button class="tag-clear-all" id="btn-clear-all-ingredients">Clear All</button>
    `;

    // Keep on-page picker in sync
    renderOnPageIngredientPicker();

    // Save to localStorage
    localStorage.setItem('rasoi_pantry', JSON.stringify(Array.from(state.selectedIngredients)));
  }

  function addIngredient(rawText) {
    if (!rawText) return;
    const normalized = normalizeIngredient(rawText);
    if (!normalized) return;

    if (state.selectedIngredients.has(normalized)) {
      showToast(`"${capitalize(normalized)}" is already in your pantry!`);
      return;
    }

    state.selectedIngredients.add(normalized);
    renderSelectedShelf();
    calculateAndRenderRecipes();

    if (elements.ingredientInput) {
      elements.ingredientInput.value = '';
    }
    closeAutocomplete();
  }

  function removeIngredient(item) {
    state.selectedIngredients.delete(item);
    renderSelectedShelf();
    calculateAndRenderRecipes();
  }

  function clearAllIngredients() {
    state.selectedIngredients.clear();
    renderSelectedShelf();
    calculateAndRenderRecipes();
    showToast('Pantry cleared!');
  }

  function applyPantryPreset(presetKey) {
    const list = PANTRY_PRESETS[presetKey];
    if (!list) return;

    state.selectedIngredients.clear();
    list.forEach(i => state.selectedIngredients.add(normalizeIngredient(i)));
    renderSelectedShelf();
    calculateAndRenderRecipes();
    showToast(`Loaded ${capitalize(presetKey)} pantry preset!`);
  }

  function renderPantryPresets() {
    if (!elements.pantryPresetsContainer) return;
    elements.pantryPresetsContainer.innerHTML = `
      <span class="presets-label">Quick Presets:</span>
      <button class="preset-chip" data-preset="essentials">🧅 Indian Essentials</button>
      <button class="preset-chip" data-preset="bachelor">🍳 Bachelor / Student</button>
      <button class="preset-chip" data-preset="vegetarian">🌱 Vegetarian Favorites</button>
      <button class="preset-chip" data-preset="southIndian">🥥 South Indian Stash</button>
    `;
  }

  // ==========================================================================
  // Autocomplete Suggestions
  // ==========================================================================
  function handleAutocompleteInput(e) {
    const query = e.target.value.trim().toLowerCase();
    if (!query || query.length < 1) {
      closeAutocomplete();
      return;
    }

    const matches = ALL_INGREDIENTS.filter(
      item => item.includes(query) && !state.selectedIngredients.has(item)
    ).slice(0, 6);

    if (matches.length === 0) {
      closeAutocomplete();
      return;
    }

    elements.autocompleteDropdown.innerHTML = matches
      .map(
        item => `
        <div class="autocomplete-item" data-autocomplete-value="${item}">
          <span>${capitalize(item)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">+ Add</span>
        </div>
      `
      )
      .join('');

    elements.autocompleteDropdown.classList.add('active');
  }

  function closeAutocomplete() {
    if (elements.autocompleteDropdown) {
      elements.autocompleteDropdown.classList.remove('active');
      elements.autocompleteDropdown.innerHTML = '';
    }
  }

  // ==========================================================================
  // Recipe Detail Modal & Serving Scaler
  // ==========================================================================
  function openRecipeModal(recipeId) {
    const recipe = RECIPES_DATA.find(r => r.id === recipeId);
    if (!recipe) return;

    state.currentRecipe = recipe;
    state.currentServings = recipe.servings;

    renderRecipeModalContent();
    elements.recipeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeRecipeModal() {
    elements.recipeModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderRecipeModalContent() {
    const recipe = state.currentRecipe;
    if (!recipe) return;

    const modalContainer = elements.recipeModal.querySelector('.modal-content-container');
    const scaleFactor = state.currentServings / recipe.servings;
    const isFav = state.favorites.has(recipe.id);

    // Calculate matched vs missing ingredients
    const { matched, missing } = matchRecipe(recipe);

    const ingredientsHtml = recipe.ingredients
      .map(ing => {
        const isMatched = matched.some(m => m.item === ing.item);
        const scaledAmount = ing.amount
          ? Math.round(ing.amount * scaleFactor * 10) / 10
          : '';
        const displayAmount = scaledAmount ? `${scaledAmount} ${ing.unit}` : ing.unit;

        return `
        <div class="ing-item-row ${isMatched ? 'have' : 'missing'}">
          <span class="ing-status-icon">${isMatched ? '✅' : '⚠️'}</span>
          <div class="ing-item-details">
            <div class="ing-item-name">
              ${displayAmount} ${capitalize(ing.item)}
            </div>
            ${
              ing.substitute
                ? `<span class="ing-substitute-hint">💡 Substitute: ${ing.substitute}</span>`
                : ''
            }
          </div>
        </div>
      `;
      })
      .join('');

    const stepsHtml = recipe.instructions
      .map(
        (step, index) => `
        <div class="step-card">
          <div class="step-number-bubble">${index + 1}</div>
          <div class="step-text">${step}</div>
        </div>
      `
      )
      .join('');

    modalContainer.innerHTML = `
      <button class="modal-close-btn" id="modal-close-btn" aria-label="Close Modal">&times;</button>
      
      <div class="modal-hero-banner">
        <img class="modal-hero-img" src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'" />
        <div class="modal-hero-gradient"></div>
        <div class="modal-hero-text">
          <span class="diet-pill ${recipe.diet === 'vegan' ? 'vegan' : recipe.diet === 'non-vegetarian' ? 'nonveg' : 'veg'}">
            ${recipe.diet.toUpperCase()} • ${recipe.cuisine}
          </span>
          <h2>${recipe.title}</h2>
          <p>${recipe.hindiTitle} • ⏱️ ${recipe.prepTime + recipe.cookTime} mins total • 🔥 ${recipe.calories} kcal/serving</p>
        </div>
      </div>

      <div class="modal-body">
        <!-- Serving Scaler -->
        <div class="serving-scaler-box">
          <div class="scaler-info">
            🥘 Adjust Portions (Ingredients dynamically scale to reduce food waste!)
          </div>
          <div class="scaler-controls">
            <button class="scaler-btn" id="scaler-minus" title="Decrease servings">-</button>
            <span class="scaler-value" id="scaler-display">${state.currentServings} Servings</span>
            <button class="scaler-btn" id="scaler-plus" title="Increase servings">+</button>
          </div>
        </div>

        <!-- Ingredients Section -->
        <div class="modal-section-title">
          <span>Ingredients Needed</span>
          ${
            missing.length > 0
              ? `<button class="btn-add-missing-grocery" id="btn-add-all-missing" data-recipe-id="${recipe.id}">
                  🛒 Add ${missing.length} Missing to Shopping List
                </button>`
              : `<span style="font-size:0.8rem; color:var(--veg-green); font-weight:700;">✓ All in your pantry!</span>`
          }
        </div>

        <div class="ingredients-list-grid">
          ${ingredientsHtml}
        </div>

        <!-- Whole Spices & Seasonings -->
        <div style="margin-bottom: 1.8rem;">
          <h4 style="font-size:0.88rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.5rem; letter-spacing:0.5px;">
            Aromatic Spices & Tadka:
          </h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${recipe.spices
              .map(
                s => `
              <span style="background:var(--bg-subtle); border:1px solid var(--border-color); padding:0.25rem 0.65rem; border-radius:var(--radius-full); font-size:0.8rem; font-weight:600;">
                🌶️ ${s}
              </span>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Steps Timeline -->
        <h3 class="modal-section-title">Step-by-Step Cooking Directions</h3>
        <div class="steps-timeline">
          ${stepsHtml}
        </div>

        <!-- Zero Waste & Chef Secret Callout Boxes -->
        <div class="chef-tips-container">
          <div class="callout-box callout-waste">
            <div class="callout-title">♻️ Zero-Food-Waste Rasoi Tip</div>
            <p>${recipe.zeroWasteTip}</p>
          </div>
          <div class="callout-box callout-secret">
            <div class="callout-title">👨‍🍳 Chef's Desi Secret</div>
            <p>${recipe.chefSecret}</p>
          </div>
        </div>

        <!-- Nutritional Facts Breakdown -->
        <h3 class="modal-section-title">Estimated Nutrition (Per Serving)</h3>
        <div class="nutrition-grid">
          <div class="nutrition-cell">
            <div class="nutrition-value">${recipe.nutrition.protein}</div>
            <div class="nutrition-label">Protein</div>
          </div>
          <div class="nutrition-cell">
            <div class="nutrition-value">${recipe.nutrition.carbs}</div>
            <div class="nutrition-label">Carbs</div>
          </div>
          <div class="nutrition-cell">
            <div class="nutrition-value">${recipe.nutrition.fat}</div>
            <div class="nutrition-label">Fats</div>
          </div>
          <div class="nutrition-cell">
            <div class="nutrition-value">${recipe.nutrition.fiber}</div>
            <div class="nutrition-label">Fiber</div>
          </div>
        </div>

        <!-- Modal Action Footer -->
        <div class="modal-bottom-actions">
          <button class="btn-primary-action" id="btn-start-guided-cooking">
            <span>👨‍🍳 Start Guided Cooking Mode (Step-by-Step + Timer)</span>
          </button>
          <button class="btn-secondary-action" id="btn-modal-toggle-fav">
            <span>${isFav ? '❤️ Saved' : '🤍 Save'}</span>
          </button>
          <button class="btn-secondary-action" id="btn-print-recipe">
            <span>🖨️ Print</span>
          </button>
        </div>
      </div>
    `;

    // Rebind dynamic elements inside the newly rendered modal
    const closeBtn = modalContainer.querySelector('#modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeRecipeModal);

    const btnMinus = modalContainer.querySelector('#scaler-minus');
    const btnPlus = modalContainer.querySelector('#scaler-plus');
    if (btnMinus && btnPlus) {
      btnMinus.addEventListener('click', () => {
        if (state.currentServings > 1) {
          state.currentServings--;
          renderRecipeModalContent();
        }
      });
      btnPlus.addEventListener('click', () => {
        if (state.currentServings < 12) {
          state.currentServings++;
          renderRecipeModalContent();
        }
      });
    }

    const btnAddAllMissing = modalContainer.querySelector('#btn-add-all-missing');
    if (btnAddAllMissing) {
      btnAddAllMissing.addEventListener('click', () => {
        missing.forEach(m => addMissingToShopping(m.item, recipe.title));
        showToast(`Added ${missing.length} missing ingredients to Shopping List!`);
        updateBadges();
      });
    }

    const btnStartGuided = modalContainer.querySelector('#btn-start-guided-cooking');
    if (btnStartGuided) {
      btnStartGuided.addEventListener('click', () => {
        closeRecipeModal();
        openGuidedCooking(recipe);
      });
    }

    const btnModalToggleFav = modalContainer.querySelector('#btn-modal-toggle-fav');
    if (btnModalToggleFav) {
      btnModalToggleFav.addEventListener('click', () => {
        toggleFavorite(recipe.id);
        renderRecipeModalContent();
      });
    }

    const btnPrint = modalContainer.querySelector('#btn-print-recipe');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }
  }

  // ==========================================================================
  // Guided Cooking Mode & Audio-Beep Cooking Timer
  // ==========================================================================
  function openGuidedCooking(recipe) {
    state.currentRecipe = recipe;
    state.guidedStepIndex = 0;
    resetTimer();

    updateGuidedStepUI();
    elements.guidedModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeGuidedCooking() {
    stopTimer();
    elements.guidedModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateGuidedStepUI() {
    const recipe = state.currentRecipe;
    if (!recipe) return;

    const totalSteps = recipe.instructions.length;
    const currentStep = state.guidedStepIndex;

    elements.guidedStepBadge.textContent = `Step ${currentStep + 1} of ${totalSteps} • ${recipe.title}`;
    elements.guidedStepText.textContent = recipe.instructions[currentStep];

    const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
    elements.guidedProgressFill.style.width = `${progressPercent}%`;

    elements.btnGuidedPrev.disabled = currentStep === 0;
    elements.btnGuidedNext.textContent = currentStep === totalSteps - 1 ? 'Finish Cooking 🥳' : 'Next Step →';
  }

  // Web Audio API Beep Sound when Timer ends
  function playTimerCompletionSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (freq, delay, dur) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + dur);
        }, delay);
      };

      playBeep(587.33, 0, 0.2); // D5
      playBeep(739.99, 250, 0.2); // F#5
      playBeep(880.0, 500, 0.4); // A5
    } catch (e) {
      console.warn('AudioContext not supported or allowed without prior user interaction', e);
    }
  }

  function setTimerDuration(seconds) {
    stopTimer();
    state.timerSecondsLeft = seconds;
    updateTimerDigits();
  }

  function updateTimerDigits() {
    const mins = Math.floor(state.timerSecondsLeft / 60);
    const secs = state.timerSecondsLeft % 60;
    elements.timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  function toggleTimer() {
    if (state.isTimerRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (state.timerSecondsLeft <= 0) {
      state.timerSecondsLeft = 300; // default 5 mins
    }
    state.isTimerRunning = true;
    elements.btnTimerToggle.textContent = 'Pause ⏸️';
    elements.btnTimerToggle.style.background = 'var(--accent-gold)';

    state.timerInterval = setInterval(() => {
      state.timerSecondsLeft--;
      updateTimerDigits();

      if (state.timerSecondsLeft <= 0) {
        stopTimer();
        playTimerCompletionSound();
        showToast('⏰ Rasoi Timer Finished! Check your dish!');
      }
    }, 1000);
  }

  function stopTimer() {
    state.isTimerRunning = false;
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    elements.btnTimerToggle.textContent = 'Start ▶️';
    elements.btnTimerToggle.style.background = 'var(--veg-green)';
  }

  function resetTimer() {
    stopTimer();
    state.timerSecondsLeft = 300; // 5 min default
    updateTimerDigits();
  }

  // ==========================================================================
  // Smart Shopping List
  // ==========================================================================
  function addMissingToShopping(itemName, recipeTitle) {
    const exists = state.shoppingList.some(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!exists) {
      state.shoppingList.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name: capitalize(itemName),
        recipeTitle: recipeTitle || 'Kitchen Grocery',
        checked: false
      });
      saveShoppingList();
    }
  }

  function saveShoppingList() {
    localStorage.setItem('rasoi_shopping', JSON.stringify(state.shoppingList));
    updateBadges();
    renderShoppingListModal();
  }

  function openShoppingModal() {
    renderShoppingListModal();
    elements.shoppingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeShoppingModal() {
    elements.shoppingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderShoppingListModal() {
    if (!elements.shoppingItemsContainer) return;

    if (state.shoppingList.length === 0) {
      elements.shoppingItemsContainer.innerHTML = `
        <div style="text-align:center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🛒</div>
          <p>Your grocery list is empty!</p>
          <p style="font-size:0.8rem; margin-top:0.3rem;">When viewing a recipe, click "Add Missing to Shopping List" to save items here.</p>
        </div>
      `;
      return;
    }

    elements.shoppingItemsContainer.innerHTML = state.shoppingList
      .map(
        item => `
        <div class="grocery-item-row">
          <label class="grocery-item-left">
            <input 
              type="checkbox" 
              class="grocery-checkbox" 
              data-shop-id="${item.id}" 
              ${item.checked ? 'checked' : ''} 
            />
            <div>
              <span class="grocery-text ${item.checked ? 'checked' : ''}">${item.name}</span>
              <div style="font-size:0.74rem; color:var(--text-muted);">${item.recipeTitle}</div>
            </div>
          </label>
          <button class="grocery-delete-btn" data-shop-delete="${item.id}" title="Remove item">&times;</button>
        </div>
      `
      )
      .join('');
  }

  function copyShoppingList() {
    if (state.shoppingList.length === 0) {
      showToast('Shopping list is empty!');
      return;
    }

    const itemsText = state.shoppingList
      .map(i => `${i.checked ? '✅' : '⬜'} ${i.name} (for ${i.recipeTitle})`)
      .join('\n');

    const fullMessage = `🛒 *RasoiSmart Grocery Shopping List*\n\n${itemsText}\n\nGenerated with RasoiSmart Indian Recipe Finder`;

    navigator.clipboard
      .writeText(fullMessage)
      .then(() => showToast('Shopping list copied to clipboard! (Ready to paste on WhatsApp)'))
      .catch(() => showToast('Could not copy to clipboard.'));
  }

  function clearShoppingList() {
    state.shoppingList = [];
    saveShoppingList();
    showToast('Shopping list cleared!');
  }

  // ==========================================================================
  // Categorized Pantry Modal
  // ==========================================================================
  function renderCategorizedPantryModal() {
    const container = document.getElementById('pantry-categories-container');
    if (!container) return;

    const categories = [
      {
        name: 'Vegetables & Aromatics',
        items: ['onion', 'tomato', 'potato', 'ginger', 'garlic', 'green chilli', 'spinach', 'cauliflower', 'green peas', 'capsicum', 'eggplant', 'carrot', 'cabbage']
      },
      {
        name: 'Dairy & Proteins',
        items: ['paneer', 'curd', 'milk', 'butter', 'ghee', 'cream', 'egg', 'chicken']
      },
      {
        name: 'Lentils, Dals & Pulses',
        items: ['toor dal', 'moong dal', 'urad dal', 'chickpeas', 'rajma']
      },
      {
        name: 'Grains, Flours & Staples',
        items: ['rice', 'cooked rice', 'wheat flour', 'besan', 'suji', 'poha', 'bread', 'pav', 'dosa batter', 'noodles', 'puffed rice']
      },
      {
        name: 'Nuts, Seeds & Aromatics',
        items: ['peanuts', 'cashew', 'curry leaves', 'lemon', 'coconut', 'methi']
      }
    ];

    container.innerHTML = categories
      .map(
        cat => `
        <div class="pantry-category-block">
          <h4>${cat.name}</h4>
          <div class="pantry-item-chips">
            ${cat.items
              .map(item => {
                const isSelected = state.selectedIngredients.has(item);
                return `
                <button 
                  class="pantry-item-chip ${isSelected ? 'selected' : ''}" 
                  data-toggle-pantry-item="${item}"
                >
                  ${isSelected ? '✓ ' : '+ '}${capitalize(item)}
                </button>
              `;
              })
              .join('')}
          </div>
        </div>
      `
      )
      .join('');
  }

  function openPantryModal() {
    renderCategorizedPantryModal();
    elements.pantryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePantryModal() {
    elements.pantryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // Leftover "Use It Up" Section
  // ==========================================================================
  function renderLeftoverSection() {
    if (!elements.leftoverCardsContainer) return;

    elements.leftoverCardsContainer.innerHTML = LEFTOVER_HEROES.map(hero => {
      const recipeLinks = hero.recipes
        .map(recipeId => {
          const recipe = RECIPES_DATA.find(r => r.id === recipeId);
          if (!recipe) return '';
          return `
            <a class="leftover-recipe-link" data-open-leftover-recipe="${recipe.id}">
              → ${recipe.title} (${recipe.cookTime}m)
            </a>
          `;
        })
        .join('');

      return `
        <div class="leftover-card">
          <h3>♻️ ${hero.leftover}</h3>
          <p>${hero.description}</p>
          <div class="leftover-recipe-links">
            ${recipeLinks}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // Kitchen Substitutions Guide Modal
  // ==========================================================================
  function renderSubstitutionsTable(filterQuery = '') {
    if (!elements.subsTableBody) return;

    const query = filterQuery.toLowerCase().trim();
    const filtered = KITCHEN_SUBSTITUTIONS.filter(
      s =>
        s.ingredient.toLowerCase().includes(query) ||
        s.substitute.toLowerCase().includes(query) ||
        s.tip.toLowerCase().includes(query)
    );

    elements.subsTableBody.innerHTML = filtered
      .map(
        s => `
        <tr>
          <td><strong>${s.ingredient}</strong></td>
          <td style="color:var(--primary); font-weight:600;">${s.substitute}</td>
          <td style="color:var(--text-secondary); font-size:0.84rem;">${s.tip}</td>
        </tr>
      `
      )
      .join('');
  }

  function openSubstitutionsModal() {
    renderSubstitutionsTable('');
    if (elements.subsSearchInput) elements.subsSearchInput.value = '';
    elements.substitutionsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSubstitutionsModal() {
    elements.substitutionsModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ==========================================================================
  // Favorites Management
  // ==========================================================================
  function toggleFavorite(recipeId) {
    if (state.favorites.has(recipeId)) {
      state.favorites.delete(recipeId);
      showToast('Removed from favorites.');
    } else {
      state.favorites.add(recipeId);
      showToast('Saved to your favorites! ❤️');
    }
    localStorage.setItem('rasoi_favorites', JSON.stringify(Array.from(state.favorites)));
    updateBadges();
    calculateAndRenderRecipes();
  }

  // ==========================================================================
  // Theme Toggle (Dark / Light Mode)
  // ==========================================================================
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rasoi_theme', theme);
    if (elements.themeToggle) {
      elements.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      elements.themeToggle.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }
  }

  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================
  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Update Navigation Badges
  function updateBadges() {
    if (elements.favCountBadge) {
      elements.favCountBadge.textContent = state.favorites.size;
    }
    if (elements.shoppingCountBadge) {
      const activeCount = state.shoppingList.filter(i => !i.checked).length;
      elements.shoppingCountBadge.textContent = activeCount;
    }
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==========================================================================
  // Event Listeners Binding
  // ==========================================================================
  function bindEventListeners() {
    // Theme toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Add ingredient button
    if (elements.btnAddIngredient) {
      elements.btnAddIngredient.addEventListener('click', () => {
        addIngredient(elements.ingredientInput.value);
      });
    }

    // Input Enter key & autocomplete
    if (elements.ingredientInput) {
      elements.ingredientInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addIngredient(elements.ingredientInput.value);
        } else if (e.key === 'Escape') {
          closeAutocomplete();
        }
      });

      elements.ingredientInput.addEventListener('input', handleAutocompleteInput);
    }

    // Autocomplete click
    if (elements.autocompleteDropdown) {
      elements.autocompleteDropdown.addEventListener('click', e => {
        const item = e.target.closest('[data-autocomplete-value]');
        if (item) {
          addIngredient(item.getAttribute('data-autocomplete-value'));
        }
      });
    }

    // Click outside to close autocomplete
    document.addEventListener('click', e => {
      if (
        elements.autocompleteDropdown &&
        !elements.autocompleteDropdown.contains(e.target) &&
        e.target !== elements.ingredientInput
      ) {
        closeAutocomplete();
      }
    });

    // Selected Shelf remove tag & clear all
    if (elements.selectedShelf) {
      elements.selectedShelf.addEventListener('click', e => {
        const removeBtn = e.target.closest('[data-remove-ing]');
        if (removeBtn) {
          removeIngredient(removeBtn.getAttribute('data-remove-ing'));
          return;
        }

        const clearBtn = e.target.closest('#btn-clear-all-ingredients');
        if (clearBtn) {
          clearAllIngredients();
        }
      });
    }

    // Quick Presets Click
    if (elements.pantryPresetsContainer) {
      elements.pantryPresetsContainer.addEventListener('click', e => {
        const chip = e.target.closest('[data-preset]');
        if (chip) {
          applyPantryPreset(chip.getAttribute('data-preset'));
        }
      });
    }

    // On-Page Ingredient Picker Category Tabs
    if (elements.pickerCategoryTabs) {
      elements.pickerCategoryTabs.addEventListener('click', e => {
        const tab = e.target.closest('.picker-tab');
        if (tab) {
          elements.pickerCategoryTabs.querySelectorAll('.picker-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          state.pickerCategory = tab.getAttribute('data-tab');
          renderOnPageIngredientPicker();
        }
      });
    }

    // On-Page Ingredient Picker Toggle Chips (Click ingredient to add/remove)
    if (elements.pickerChipsGrid) {
      elements.pickerChipsGrid.addEventListener('click', e => {
        const chip = e.target.closest('[data-picker-id]');
        if (chip) {
          const ingId = chip.getAttribute('data-picker-id');
          if (state.selectedIngredients.has(ingId)) {
            state.selectedIngredients.delete(ingId);
          } else {
            state.selectedIngredients.add(ingId);
          }
          renderSelectedShelf();
          calculateAndRenderRecipes();
        }
      });
    }

    // Key Ingredient Food Selector Strip (Select food by ingredient)
    if (elements.keyFoodChipsWrapper) {
      elements.keyFoodChipsWrapper.addEventListener('click', e => {
        const chip = e.target.closest('[data-key-food]');
        if (chip) {
          elements.keyFoodChipsWrapper.querySelectorAll('.key-food-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeKeyFood = chip.getAttribute('data-key-food');
          calculateAndRenderRecipes();
        }
      });
    }

    // Categorized Pantry Modal open / close
    if (elements.btnOpenPantryModal) {
      elements.btnOpenPantryModal.addEventListener('click', openPantryModal);
    }
    if (elements.pantryModalCloseBtn) {
      elements.pantryModalCloseBtn.addEventListener('click', closePantryModal);
    }

    // Toggle items inside Pantry Modal
    const pantryCatContainer = document.getElementById('pantry-categories-container');
    if (pantryCatContainer) {
      pantryCatContainer.addEventListener('click', e => {
        const chip = e.target.closest('[data-toggle-pantry-item]');
        if (chip) {
          const item = chip.getAttribute('data-toggle-pantry-item');
          if (state.selectedIngredients.has(item)) {
            state.selectedIngredients.delete(item);
          } else {
            state.selectedIngredients.add(item);
          }
          renderCategorizedPantryModal();
          renderSelectedShelf();
          calculateAndRenderRecipes();
        }
      });
    }

    // Filter Chips (Diet)
    elements.filterDietChips.forEach(chip => {
      chip.addEventListener('click', () => {
        elements.filterDietChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeDiet = chip.getAttribute('data-diet');
        calculateAndRenderRecipes();
      });
    });

    // Sort select
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', e => {
        state.activeSort = e.target.value;
        calculateAndRenderRecipes();
      });
    }

    // Meal select
    if (elements.mealSelect) {
      elements.mealSelect.addEventListener('change', e => {
        state.activeMeal = e.target.value;
        calculateAndRenderRecipes();
      });
    }

    // Ready to cook toggle
    if (elements.readyOnlyToggle) {
      elements.readyOnlyToggle.addEventListener('change', e => {
        state.onlyReadyToCook = e.target.checked;
        calculateAndRenderRecipes();
      });
    }

    // Navigation Buttons
    if (elements.btnNavFavorites) {
      elements.btnNavFavorites.addEventListener('click', () => {
        state.viewMode = state.viewMode === 'favorites' ? 'all' : 'favorites';
        elements.btnNavFavorites.classList.toggle('active', state.viewMode === 'favorites');
        calculateAndRenderRecipes();
      });
    }

    if (elements.btnNavShopping) {
      elements.btnNavShopping.addEventListener('click', openShoppingModal);
    }
    if (elements.shoppingCloseBtn) {
      elements.shoppingCloseBtn.addEventListener('click', closeShoppingModal);
    }

    if (elements.btnNavSubstitutions) {
      elements.btnNavSubstitutions.addEventListener('click', openSubstitutionsModal);
    }
    if (elements.subsCloseBtn) {
      elements.subsCloseBtn.addEventListener('click', closeSubstitutionsModal);
    }

    // Substitutions Search Input
    if (elements.subsSearchInput) {
      elements.subsSearchInput.addEventListener('input', e => {
        renderSubstitutionsTable(e.target.value);
      });
    }

    // Recipe Grid Delegated Events (View Recipe & Favorite)
    if (elements.recipesGrid) {
      elements.recipesGrid.addEventListener('click', e => {
        const favBtn = e.target.closest('[data-fav-id]');
        if (favBtn) {
          e.stopPropagation();
          toggleFavorite(favBtn.getAttribute('data-fav-id'));
          return;
        }

        const viewBtn = e.target.closest('.btn-view-recipe, .recipe-card');
        if (viewBtn) {
          const recipeId = viewBtn.getAttribute('data-recipe-id');
          if (recipeId) openRecipeModal(recipeId);
        }
      });
    }

    // Leftover Cards Delegated Events
    if (elements.leftoverCardsContainer) {
      elements.leftoverCardsContainer.addEventListener('click', e => {
        const link = e.target.closest('[data-open-leftover-recipe]');
        if (link) {
          const recipeId = link.getAttribute('data-open-leftover-recipe');
          if (recipeId) openRecipeModal(recipeId);
        }
      });
    }

    // Guided Cooking Step Prev / Next Buttons
    if (elements.btnGuidedPrev) {
      elements.btnGuidedPrev.addEventListener('click', () => {
        if (state.guidedStepIndex > 0) {
          state.guidedStepIndex--;
          updateGuidedStepUI();
        }
      });
    }

    if (elements.btnGuidedNext) {
      elements.btnGuidedNext.addEventListener('click', () => {
        const recipe = state.currentRecipe;
        if (!recipe) return;
        if (state.guidedStepIndex < recipe.instructions.length - 1) {
          state.guidedStepIndex++;
          updateGuidedStepUI();
        } else {
          showToast('🎉 Shabaash! Delicious Indian meal ready to serve!');
          closeGuidedCooking();
        }
      });
    }

    if (elements.guidedCloseBtn) {
      elements.guidedCloseBtn.addEventListener('click', closeGuidedCooking);
    }

    // Timer Controls
    if (elements.btnTimerToggle) {
      elements.btnTimerToggle.addEventListener('click', toggleTimer);
    }
    if (elements.btnTimerReset) {
      elements.btnTimerReset.addEventListener('click', resetTimer);
    }

    // Timer Preset Buttons
    const timerPresetsWrap = document.getElementById('timer-presets-wrap');
    if (timerPresetsWrap) {
      timerPresetsWrap.addEventListener('click', e => {
        const btn = e.target.closest('[data-timer-preset]');
        if (btn) {
          const secs = parseInt(btn.getAttribute('data-timer-preset'), 10);
          setTimerDuration(secs);
        }
      });
    }

    // Shopping List Delegated Events (Check off / Delete)
    if (elements.shoppingItemsContainer) {
      elements.shoppingItemsContainer.addEventListener('change', e => {
        const checkbox = e.target.closest('.grocery-checkbox');
        if (checkbox) {
          const id = checkbox.getAttribute('data-shop-id');
          const item = state.shoppingList.find(i => i.id === id);
          if (item) {
            item.checked = checkbox.checked;
            saveShoppingList();
          }
        }
      });

      elements.shoppingItemsContainer.addEventListener('click', e => {
        const delBtn = e.target.closest('[data-shop-delete]');
        if (delBtn) {
          const id = delBtn.getAttribute('data-shop-delete');
          state.shoppingList = state.shoppingList.filter(i => i.id !== id);
          saveShoppingList();
        }
      });
    }

    if (elements.btnCopyShoppingList) {
      elements.btnCopyShoppingList.addEventListener('click', copyShoppingList);
    }
    if (elements.btnClearShoppingList) {
      elements.btnClearShoppingList.addEventListener('click', clearShoppingList);
    }

    // Close Modals on click outside
    [elements.recipeModal, elements.guidedModal, elements.pantryModal, elements.shoppingModal, elements.substitutionsModal].forEach(
      modal => {
        if (modal) {
          modal.addEventListener('click', e => {
            if (e.target === modal) {
              modal.classList.remove('active');
              document.body.style.overflow = '';
              if (modal === elements.guidedModal) stopTimer();
            }
          });
        }
      }
    );
  }

  // Run on DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

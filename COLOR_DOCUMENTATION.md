# UI Components Color Usage Documentation

## 📊 Complete Color Inventory (Self-Declared Form)

### daisyUI Semantic Color System Applied

All Tailwind color utility classes have been successfully replaced with daisyUI semantic colors for theme switching compatibility.

---

## 🎨 Color Patterns by Component

### 1. **App.tsx** - Main Application Layout

```tsx
// Background & Layout
bg-base-200          // Main background (was bg-gray-100)

// Typography
text-base-content    // Main heading text (was text-gray-900)
text-base-content/70 // Subtitle text (was text-gray-600)
text-base-content/50 // Footer text (was text-gray-500)

// Interactive Elements
bg-error text-error-content           // Error button background & text
hover:bg-error/90                     // Error hover state
focus:ring-error focus:ring-offset-2  // Error focus ring
```

### 2. **WeeklyTimetable.tsx** - Timetable Display

```tsx
// Cards & Containers
bg-base-100          // Main card backgrounds
bg-base-200          // Header backgrounds, secondary areas
card-body            // daisyUI card body styling

// Borders & Dividers
border-base-300      // Standard borders
border-base-300/50   // Subtle dividers

// Typography
text-base-content    // Main text content
text-base-content/70 // Secondary text (times, labels)
text-base-content/60 // Muted text (descriptions)
text-base-content/40 // Very muted (icons)

// Status Colors
bg-primary-content   // Course blocks (primary)
bg-warning-content   // Warning state courses
bg-error-content     // Error state courses
text-primary         // Primary accent text

// Interactive Elements
badge-ghost badge-xs // Small badges
```

### 3. **SettingsPanel.tsx** - Configuration Panel

```tsx
// Containers
bg-base-200          // Main panel background
bg-base-100          // Individual setting cards

// Typography & Labels
text-base           // Card titles
label-text          // Form labels
label-text-alt      // Helper text
text-xs opacity-70  // Small helper text

// Accent Colors
text-secondary      // Secondary icons
text-accent         // Accent icons
text-success        // Success icons
border-primary      // Primary accent borders
```

### 4. **CourseList.tsx** - Course Management

```tsx
// Containers
bg-base-100         // Card backgrounds (was bg-white)
bg-base-200         // Course item backgrounds (was bg-gray-50)

// Typography
text-base-content   // Headers, course titles (was text-gray-800/900)
text-base-content/70 // Course details (was text-gray-600)
text-base-content/60 // Empty state text (was text-gray-500)

// Accents & Actions
border-primary      // Day section borders (was border-blue-500)
text-neutral-content bg-neutral  // Location badges (was text-gray-500 bg-gray-200)
text-error hover:text-error/80   // Delete buttons (was text-red-600 hover:text-red-800)
hover:bg-error/10   // Delete button hover background (was hover:bg-red-50)
```

### 5. **CSVUploader.tsx** - File Upload Component

```tsx
// Containers
bg-base-100         // Main container (was bg-white)

// Typography
text-base-content   // Headers (was text-gray-800)
text-base-content/70 // Help text (was text-gray-600)

// File Input Styling
file:bg-primary/10 file:text-primary       // File button (was file:bg-blue-50 file:text-blue-700)
hover:file:bg-primary/20                   // File button hover (was hover:file:bg-blue-100)

// Interactive Elements
text-primary hover:text-primary/80         // Download links (was text-blue-600 hover:text-blue-800)
text-primary border-primary                // Processing state (was text-blue-600 border-blue-600)

// Status Messages
bg-error/10 border-error/20 text-error     // Error messages (was bg-red-50 border-red-200 text-red-800)
bg-success/10 border-success/20 text-success // Success messages (was bg-green-50 border-green-200 text-green-800)
```

### 6. **CourseForm.tsx** - Course Input Form

```tsx
// Containers
bg-base-100         // Form container (was bg-white)

// Typography & Labels
text-base-content   // Headers, labels (was text-gray-800/700)

// Form Controls
border-base-300     // Input borders (was border-gray-300)
focus:ring-primary  // Focus rings (was focus:ring-blue-500)

// Day Selection Buttons
bg-primary/20 text-primary border-primary    // Selected state (was bg-blue-100 text-blue-800 border-blue-300)
bg-base-100 text-base-content border-base-300 // Unselected state (was bg-white text-gray-700 border-gray-300)
hover:bg-base-200   // Hover state (was hover:bg-gray-100)

// Error States
text-error          // Error messages (was text-red-600)
border-error bg-error/10 // Error input styling (was border-red-500 bg-red-50)
```

### 7. **ScaleSlider.tsx** - Interactive Scale Control

```tsx
// Slider Components
bg-base-300         // Track background
bg-primary          // Progress fill (was bg-blue-400/500)
bg-gradient-to-r from-primary/20 to-primary/40 // Gradient overlay

// Labels & Typography
badge-primary badge-sm    // Value display badge
text-base-content/60      // Scale labels

// Focus States
focus:outline-primary focus:outline-offset-2  // Focus styling
```

---

## 🏗️ Structure Analysis & Unified Styling

### **Consistent Patterns Applied:**

1. **Background Hierarchy:**
   - `bg-base-200` - Page/app backgrounds
   - `bg-base-100` - Card/component backgrounds
   - `bg-base-200` - Secondary areas within components

2. **Typography Hierarchy:**
   - `text-base-content` - Primary text content
   - `text-base-content/70` - Secondary/muted text
   - `text-base-content/60` - Helper/description text
   - `text-base-content/50` - Very muted text (footers)
   - `text-base-content/40` - Icon tinting

3. **Border System:**
   - `border-base-300` - Standard borders
   - `border-base-300/50` - Subtle dividers
   - `border-primary` - Accent borders

4. **Interactive States:**
   - `hover:bg-base-200` - Standard hover backgrounds
   - `focus:ring-primary` - Focus rings
   - Semantic colors for specific actions (error, success, etc.)

5. **Status & Semantic Colors:**
   - `primary` - Main actions, accents, selections
   - `error` - Destructive actions, error states
   - `success` - Success messages, confirmations
   - `neutral` - Secondary information, badges
   - `secondary/accent` - Additional accent colors

### **Theme Compatibility:**

✅ All components now use daisyUI semantic colors  
✅ Automatic dark/light theme switching support  
✅ Consistent color hierarchy across components  
✅ Semantic meaning preserved (errors are red, success is green, etc.)

### **Benefits Achieved:**

- **Theme Switching**: All colors automatically adapt to theme changes
- **Consistency**: Unified color system across all components
- **Maintainability**: Semantic naming makes intent clear
- **Accessibility**: daisyUI colors are designed for good contrast ratios

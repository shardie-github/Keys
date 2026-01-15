# KEYS Design System

## Overview

The KEYS Design System is a comprehensive, production-ready system for building consistent, accessible, and performant user interfaces across all KEYS surfaces (marketing, marketplace, dashboard, auth).

**Key Principles:**
- **Consistency**: Unified typography, spacing, colors, and components
- **Accessibility**: WCAG AA/AAA compliance, keyboard navigation, semantic HTML
- **Performance**: Minimal bundle size, optimized animations, lightweight components
- **Developer Experience**: TypeScript, Tailwind CSS, CVA variants, clear documentation

---

## 1. Typography Scale

### Scale Definition

All typography uses a strict scale with explicit font sizes, line-heights, and weights:

| Level | Class | Size | Line Height | Weight | Usage |
|-------|-------|------|-------------|--------|-------|
| H1 | `.text-h1` | 48px (3rem) | 56px (3.5rem) | Bold (700) | Page titles, hero sections |
| H2 | `.text-h2` | 36px (2.25rem) | 44px (2.75rem) | Bold (700) | Section headings, major divisions |
| H3 | `.text-h3` | 24px (1.5rem) | 32px (2rem) | Semibold (600) | Subsections, card titles |
| Body | `.text-body` | 16px (1rem) | 24px (1.5rem) | Regular (400) | Body text, descriptions |
| Caption | `.text-caption` | 12px (0.75rem) | 16px (1rem) | Regular (400) | Footnotes, metadata |

### Responsive Modifiers

Apply responsive typography changes using Tailwind breakpoints:

```tsx
<h1 className="text-h3 sm:text-h2 lg:text-h1">Responsive Heading</h1>
```

### Implementation

All typography classes are defined in `frontend/src/app/globals.css` under `@layer utilities`:

```css
@layer utilities {
  .text-h1 {
    @apply text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight;
  }
  .text-h2 {
    @apply text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight;
  }
  /* ... */
}
```

---

## 2. Spacing Scale

### Base Unit: 4px

All spacing follows a consistent 4px-based scale (Tailwind default):

| Token | CSS Variable | Pixels | Tailwind |
|-------|---|---------|----------|
| `--spacing-xs` | `0.25rem` | 4px | `w-1`, `h-1` |
| `--spacing-sm` | `0.5rem` | 8px | `w-2`, `h-2` |
| `--spacing-md` | `0.75rem` | 12px | `w-3`, `h-3` |
| `--spacing-base` | `1rem` | 16px | `w-4`, `h-4` (Tailwind default) |
| `--spacing-lg` | `1.5rem` | 24px | `w-6`, `h-6` |
| `--spacing-xl` | `2rem` | 32px | `w-8`, `h-8` |
| `--spacing-2xl` | `3rem` | 48px | `w-12`, `h-12` |
| `--spacing-3xl` | `4rem` | 64px | `w-16`, `h-16` |

### Standard Patterns

**Page Padding:**
```tsx
<div className="px-4 sm:px-6 lg:px-8">Content</div>
```

**Section Spacing:**
```tsx
<div className="mb-8 sm:mb-12 lg:mb-16">
  <h2 className="text-h2 font-bold mb-4">Title</h2>
  <p className="text-body text-muted-foreground">Description</p>
</div>
```

**Grid Gaps:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
  {/* Items with consistent gap */}
</div>
```

**Form Spacing:**
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Email</Label>
    <Input type="email" />
  </div>
  {/* More fields */}
</form>
```

---

## 3. Color Palette

### Design Tokens (CSS Variables)

All colors are defined in `frontend/src/app/globals.css` root scope:

| Token | Light | Dark |
|-------|-------|------|
| `--background` | White | Slate-900 |
| `--foreground` | Slate-900 | Gray-100 |
| `--primary` | Blue-600 | Blue-400 |
| `--primary-foreground` | White | Slate-950 |
| `--muted` | Gray-100 | Slate-800 |
| `--muted-foreground` | Gray-600 | Gray-400 |
| `--border` | Gray-200 | Slate-700 |
| `--ring` | Blue-500 | Blue-500 |
| `--destructive` | Red-600 | Red-500 |

### Usage in Components

Use semantic color names, not hardcoded colors:

```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">Content</div>
<button className="text-muted-foreground hover:text-foreground">Button</button>

// ❌ Avoid
<div className="bg-blue-600 text-white">Content</div>
<button className="text-gray-600 hover:text-gray-900">Button</button>
```

### Contrast Compliance

All color combinations have been audited for WCAG AA (4.5:1) and AAA (7:1) contrast ratios:

- **Primary text on background**: 7:1 (WCAG AAA)
- **Muted text on background**: 4.5:1 (WCAG AA)
- **All light/dark mode combinations**: Verified

Test colors at [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 4. Component Library

### Base Components (in `frontend/src/components/ui/`)

#### Button
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Get Started</Button>
<Button variant="outline" size="default">Learn More</Button>
<Button variant="ghost" size="sm">View Details</Button>
<Button disabled>Disabled</Button>
```

**Variants:** `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`  
**Sizes:** `sm`, `default`, `lg`, `icon`

#### Input & Label
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Plan Name</CardTitle>
  </CardHeader>
  <CardContent>Features and details</CardContent>
</Card>
```

#### Badge
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Available</Badge>
<Badge variant="secondary">Coming Soon</Badge>
```

#### Alert
```tsx
import { Alert } from '@/components/ui/alert';

<Alert variant="destructive">
  <p>Error: Something went wrong</p>
</Alert>
```

#### Textarea
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter your message..." />
```

#### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Component Styling Patterns

**Card with hover effect:**
```tsx
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  {/* Content */}
</Card>
```

**Button with focus ring:**
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded">
  Action
</button>
```

**Grid with consistent spacing:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

---

## 5. Layout Patterns

### Container Max-Widths

```tsx
// Wide content (full-width pages, dashboards)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Standard content (marketing pages)
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

// Form-focused (narrow, centered)
<div className="max-w-md mx-auto px-4">
```

### Two-Column Layout (Content + Sidebar)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <section className="lg:col-span-2">
    {/* Main content */}
  </section>
  <aside className="space-y-8">
    {/* Sidebar widgets */}
  </aside>
</div>
```

### Hero Section
```tsx
<section className="max-w-4xl mx-auto mb-12 sm:mb-16 text-center">
  <h1 className="text-h1 font-bold mb-6">Heading</h1>
  <p className="text-body text-muted-foreground max-w-2xl mx-auto mb-8">
    Description
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button>Primary CTA</Button>
    <Button variant="outline">Secondary CTA</Button>
  </div>
</section>
```

---

## 6. Animations & Transitions

### Framer Motion Usage

Lightweight animations using Framer Motion (from `@/systems/motion`):

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>
```

### CSS Transitions (Preferred)

Use Tailwind transitions for simple effects:

```tsx
<button className="transition-all duration-200 hover:bg-primary/90">
  Button
</button>
```

### Motion Variants (Reusable)

Pre-defined variants in `frontend/src/systems/motion/variants.ts`:

```tsx
import { staggerContainerVariants, scaleVariants } from '@/systems/motion/variants';

<motion.div
  variants={staggerContainerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={scaleVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## 7. Focus & Accessibility

### Focus Ring Pattern

All interactive elements must have visible focus indicators:

```tsx
// For buttons, links
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-2"

// For form inputs
<Input className="focus:ring-2 focus:ring-primary focus:border-primary" />
```

### Keyboard Navigation

- **Tab**: Move focus forward
- **Shift+Tab**: Move focus backward
- **Enter/Space**: Activate button
- **Escape**: Close modal/dropdown
- **Arrow Keys**: Navigate within select/tabs

### Semantic HTML

Always use semantic elements:

```tsx
// ✅ Good
<nav>Navigation</nav>
<main>Main content</main>
<article>Article</article>
<button>Click me</button>
<label htmlFor="input">Label</label>

// ❌ Avoid
<div role="navigation">Navigation</div>
<div role="main">Main content</div>
<div onClick={...}>Click me</div>
```

### ARIA Labels

Provide accessible labels where needed:

```tsx
<button aria-label="Close menu">
  <X className="w-4 h-4" />
</button>

<div aria-live="polite" aria-label="Notifications">
  {message}
</div>
```

---

## 8. Dark Mode

### Implementation

Dark mode uses CSS variables and is controlled by the `.dark` class:

```css
.dark {
  --background: 222.2 84% 4.9%;  /* Slate-900 */
  --foreground: 210 40% 98%;      /* Gray-100 */
  /* ... */
}
```

### Testing Dark Mode

All pages must be tested in both light and dark modes:

1. **Browser DevTools**: Emulate `prefers-color-scheme: dark`
2. **System Settings**: Toggle system-wide dark mode
3. **Manual Testing**: Use browser extensions or native OS dark mode

### Dark Mode Best Practices

```tsx
// ✅ Use semantic colors
<div className="bg-card text-foreground">Content</div>

// ❌ Avoid hardcoded colors for interactive content
<div className="bg-white dark:bg-slate-800">Content</div>
```

---

## 9. Performance Optimization

### Bundle Size

- Tailwind CSS: ~60kb (gzipped)
- Framer Motion: ~40kb (gzipped)
- UI Components: ~20kb (gzipped)
- **Total**: ~120kb (gzipped)

### Optimization Techniques

1. **CSS Purging**: Tailwind automatically removes unused styles
2. **Code Splitting**: Use dynamic imports for heavy components
3. **Image Optimization**: Use Next.js Image component
4. **Lazy Loading**: Defer non-critical components

### Lighthouse Targets

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

---

## 10. Common Patterns

### Hero with CTA
```tsx
<section className="max-w-4xl mx-auto text-center mb-12">
  <h1 className="text-h1 font-bold mb-6">Main Heading</h1>
  <p className="text-body text-muted-foreground mb-8">Description</p>
  <div className="flex gap-4 justify-center">
    <Button size="lg">Primary</Button>
    <Button variant="outline" size="lg">Secondary</Button>
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### Form Group
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" type="text" required />
  </div>
  <div className="space-y-2">
    <Label htmlFor="message">Message</Label>
    <Textarea id="message" rows={5} />
  </div>
  <Button type="submit" size="lg" className="w-full">Submit</Button>
</form>
```

---

## 11. Migration Guide

### From Old Styles to Design System

**Before:**
```tsx
<div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
  Title
</div>
<div className="flex gap-4 p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
  Content
</div>
```

**After:**
```tsx
<h1 className="text-h1 font-bold">Title</h1>
<Card className="flex gap-4">Content</Card>
```

---

## 12. Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/docs/primitives/overview/introduction
- **Framer Motion**: https://www.framer.com/motion/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **CVA (Class Variance Authority)**: https://cva.style/docs

---

## Support & Updates

For questions or design system improvements:
1. Check existing components in `frontend/src/components/ui/`
2. Review `frontend/src/app/globals.css` for tokens
3. Consult `tailwind.config.js` for Tailwind extensions
4. Open an issue for new feature requests

Last Updated: 2025-01-15

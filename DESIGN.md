# Techastra — Design System & Visual Specification (DESIGN.md)

## Brand Philosophy & Visual Identity
Techastra fuses high-density developer utility with sleek, modern community aesthetics. High contrast, purposeful motion, zero fluff.

## Design Tokens (Tailwind v4 `@theme` Compatible)

### 1. Color Palette
```css
@theme {
  /* Canvas & Surfaces */
  --color-techastra-canvas: #0B0F19;         /* Main app background */
  --color-techastra-surface: #111827;        /* Sidebar, topbar, elevated surfaces */
  --color-techastra-card: #161E2E;           /* Event cards, modal surfaces */
  --color-techastra-card-hover: #1E293B;     /* Interactive card hover */
  --color-techastra-border: #1F2937;         /* Subtle structural borders */
  --color-techastra-border-subtle: #374151;  /* High-contrast dividers */

  /* Accents */
  --color-techastra-primary: #6366F1;        /* Indigo brand primary */
  --color-techastra-primary-hover: #4F46E5;  /* Button hover state */
  --color-techastra-cyan: #06B6D4;           /* Tech/Hackathon badge highlight */
  --color-techastra-amber: #F59E0B;          /* XP, Quest rewards, Leaderboards */
  --color-techastra-emerald: #10B981;        /* Check-in success, verified badges */
  --color-techastra-rose: #F43F5E;           /* Live indicators, urgent deadlines */

  /* Text & Hierarchy */
  --color-techastra-text-primary: #F9FAFB;   /* Headings, high-emphasis text */
  --color-techastra-text-secondary: #9CA3AF; /* Body copy, descriptions */
  --color-techastra-text-muted: #6B7280;     /* Timestamps, metadata pills */
}
```

### 2. Typography
* **Display / Brand Headings**: `'DM Serif Display', Georgia, serif` (editorial accents on landing hero & certificate titles).
* **Interface & Body**: `'Inter', system-ui, -apple-system, sans-serif` (clean, legible numbers and developer UI).
* **Code & Monospace**: `'JetBrains Mono', 'Fira Code', monospace` (team codes, API endpoints, ticket hashes).

### 3. Craft Floor Rules (Impeccable & UI/UX Pro Max Standards)
1. **Never use raw black `#000000` or raw white `#FFFFFF` on vast areas**: Use `#0B0F19` for canvas and `#F9FAFB` for text to prevent visual fatigue.
2. **Elevation through borders, not heavy drop-shadows**: Use subtle `1px solid var(--color-techastra-border)` instead of muddy, blurred shadows.
3. **Touch Targets on Mobile**: Minimum 44x44pt / 48x48dp for all interactive elements.
4. **Haptic Pairing**: Every primary mutation (RSVP confirmation, ticket check-in scan, upvote) MUST trigger distinct haptic feedback.
5. **State Completeness**: Every async surface must declare distinct Loading (skeleton with shimmer), Empty (illustrative with clear call-to-action), Error (retry button + explanatory text), and Success states.
6. **No Pixel-Clone Artifacts**: All icons, shapes, and branding are unique to Techastra.

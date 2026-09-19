# Signal Atlas — Skill Mapper Design System

Agent instruction: read this file before any UI work. Prefer tokens and classes from `src/app/globals.css`. Do not invent neon cyan/pink, Inter, Orbitron, or glass cards.

## Intent

Skill Mapper is a **skill cartography console**. Learners navigate a tree of craft nodes. The UI should feel like a precise atlas and ops panel — professional, unique to this product, never generic AI cyberpunk.

## Personality

Precise · Progressive · Crafted

## Foundations

### Color (semantic)

| Role | Token | Use |
|------|-------|-----|
| Canvas | `--canvas` | App background |
| Surface 1–3 | `--surface-1` … `--surface-3` | Panels, raised chrome |
| Foreground | `--foreground` | Primary text |
| Muted | `--text-muted` | Meta, captions |
| Border | `--border-muted` / `--border-strong` | Hairlines / emphasis |
| Signal | `--signal` | Available, focus, primary CTA |
| Mastery | `--mastery` | Mastered skills, success |
| Reward | `--reward` | XP, badges, streaks |
| Progress | `--progress` | In-progress learning |
| Decay | `--decay` | Decayed / needs repair |
| Danger | `--danger` | Errors, destructive |

Legacy class aliases (`neon-cyan`, `plasma-pink`, `electric-green`) map to signal / mastery / progress for compatibility — prefer semantic names in new code.

### Typography

| Role | Family | Token |
|------|--------|-------|
| Display | Bricolage Grotesque | `--font-display` |
| UI / body | Instrument Sans | `--font-sans` |
| Data | IBM Plex Mono | `--font-mono` |

Scale: `xs` 11px · `sm` 13px · `base` 15px · `md` 17px · `lg` 22px · `xl` 28px · `display` clamp(32px, 4vw, 44px).

### Space & radius

Space: 4 / 8 / 12 / 16 / 24 / 32 / 48  
Radius: `sm` 6px · `md` 10px · `lg` 14px · `xl` 20px  
Avoid `rounded-full` pills except for true circular avatars / progress dots.

### Motion

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances, hovers |
| `--duration-fast` | 120ms | Hover / focus |
| `--duration-base` | 200ms | Panels |
| `--duration-slow` | 420ms | XP bar, mastery |

Respect `prefers-reduced-motion`. Prefer opacity + transform only.

### Z-index

`tree` 0 · `hud` 30 · `panel` 40 · `modal` 50 · `toast` 60 · `celebration` 70

## Component anatomy

### Skill node
- Locked: muted surface, no accent glow, lock icon
- Available: signal border, subtle lift on hover (no 3D carnival)
- In-progress: progress accent + book icon
- Mastered: mastery border + soft mastery fill (no magenta)
- Decayed: decay hatch / coral border
- Selected: focus ring using `--ring-focus`

### HUD
- Solid `panel-strong` (no heavy blur)
- Avatar with signal hairline border
- XP track: muted trough + reward/signal fill
- Stats row: mono labels, icon tinted by role (reward / signal / decay-warm)

### Details panel
- Full-height dock, surface-2, hairline left border
- Description with signal left rule
- Resources as list rows (not nested cards)
- One primary CTA at footer; secondary states are status banners

### Buttons
- `.btn-primary` — signal fill, dark ink text
- `.btn-ghost` — surface + muted border
- `.btn-mastery` / `.btn-reward` / `.btn-danger` for role actions
- Never make every control primary

## Anti-patterns (do not)

- Inter, Orbitron, Roboto, Open Sans
- Cyan + magenta neon pairs, purple gradients, glow shadows
- Glassmorphism on every panel
- Identical icon+title+text card grids
- Gradient text on metrics
- Bounce / elastic easing
- Emoji as UI decoration

## Implementation

1. Tokens live in `src/app/globals.css` (`:root` + `@theme inline`)
2. Utility surfaces: `.panel-base`, `.panel-strong`, `.modal-shell`, `.metric-card`
3. When restyling a feature modal, match HUD/node language first — then local status color

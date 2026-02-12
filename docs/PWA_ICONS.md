# PWA Icons Setup

## Quick Start

The PWA manifest requires icons in various sizes. You have two options:

### Option 1: Automated Generation (Recommended)

1. **Create source icon**: Design a 512x512 PNG icon and save as `public/icon-512x512.png`
2. **Run generation script**:
   ```bash
   # Install ImageMagick (if not already installed)
   brew install imagemagick
   
   # Generate all icon sizes
   ./scripts/generate-icons.sh
   ```

### Option 2: Manual Creation

Create PNG icons in these sizes and save to `public/`:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Design Guidelines

- **Format**: PNG with transparency
- **Content**: Should work at any size (simple, bold design)
- **Colors**: Match the app's neon cyberpunk aesthetic
- **Background**: Consider both light/dark mode contexts
- **Safe area**: Keep important content within 80% of canvas

## Tools for Icon Creation

- **Figma**: Free design tool with export capabilities
- **Canva**: Easy icon design with templates
- **DALL-E/Midjourney**: AI-generated icons
- **Favicon.io**: Quick favicon and icon generator
- **RealFaviconGenerator**: PWA icon testing and generation

## Current Status

⚠️ **Icons not yet generated** - Follow steps above to create them.

Once generated, the PWA will be fully functional with offline support!

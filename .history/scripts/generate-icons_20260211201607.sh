#!/bin/bash

# PWA Icon Generator
# Generates all required icon sizes from a 512x512 source image

set -e

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Install with: brew install imagemagick"
    exit 1
fi

# Input validation
if [ -z "$1" ]; then
    echo "Usage: $0 <source-icon.svg>"
    echo "Example: $0 public/icon-512x512.svg"
    exit 1
fi

SOURCE="$1"

if [ ! -f "$SOURCE" ]; then
    echo "❌ Source file not found: $SOURCE"
    exit 1
fi

echo "🎨 Generating PWA icons from: $SOURCE"

# Create icons directory
mkdir -p public/icons

# Icon sizes to generate
SIZES=(72 96 128 144 152 192 384 512)

# Generate each size
for SIZE in "${SIZES[@]}"; do
    OUTPUT="public/icons/icon-${SIZE}x${SIZE}.png"
    echo "  ✓ Generating ${SIZE}x${SIZE}..."
    convert "$SOURCE" -resize ${SIZE}x${SIZE} -background none -gravity center -extent ${SIZE}x${SIZE} "$OUTPUT"
done

# Generate favicon.ico (multi-size ICO file)
echo "  ✓ Generating favicon.ico..."
convert "$SOURCE" -resize 16x16 -background none public/favicon-16.png
convert "$SOURCE" -resize 32x32 -background none public/favicon-32.png
convert "$SOURCE" -resize 48x48 -background none public/favicon-48.png
convert public/favicon-16.png public/favicon-32.png public/favicon-48.png public/favicon.ico
rm public/favicon-16.png public/favicon-32.png public/favicon-48.png

# Generate apple-touch-icon
echo "  ✓ Generating apple-touch-icon.png..."
convert "$SOURCE" -resize 180x180 -background none public/apple-touch-icon.png

# Generate OG image (1200x630)
echo "  ✓ Generating og-image.png..."
if [ -f "public/og-image.svg" ]; then
    convert "public/og-image.svg" -resize 1200x630 public/og-image.png
else
    # Fallback: use icon on colored background
    convert -size 1200x630 xc:"#0a0a0a" \
            \( "$SOURCE" -resize 400x400 \) \
            -gravity center -composite \
            public/og-image.png
fi

echo "✨ All icons generated successfully!"
echo ""
echo "Generated files:"
echo "  • public/icons/icon-*.png (8 sizes)"
echo "  • public/favicon.ico"
echo "  • public/apple-touch-icon.png"
echo "  • public/og-image.png"

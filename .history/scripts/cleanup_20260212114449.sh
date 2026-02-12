#!/bin/bash

# Cleanup script for Skill Mapper project
# Removes temporary files, build artifacts, and old test results

echo "🧹 Cleaning up Skill Mapper project..."

# Remove test results (keep directory structure)
if [ -d "test-results" ]; then
    echo "📊 Cleaning test results..."
    find test-results -name "*.md" -type f -delete
    echo "✅ Test result files cleaned"
fi

# Clean playwright reports (optional - uncomment if needed)
# if [ -d "playwright-report" ]; then
#     echo "🎭 Cleaning Playwright reports..."
#     rm -rf playwright-report
#     echo "✅ Playwright reports cleaned"
# fi

# Clean Next.js cache
if [ -d ".next" ]; then
    echo "⚡ Cleaning Next.js cache..."
    rm -rf .next
    echo "✅ Next.js cache cleaned"
fi

# Clean Turbopack cache
if [ -d ".turbopack" ]; then
    echo "🚀 Cleaning Turbopack cache..."
    rm -rf .turbopack
    echo "✅ Turbopack cache cleaned"
fi

# Clean coverage reports
if [ -d "coverage" ]; then
    echo "📈 Cleaning coverage reports..."
    rm -rf coverage
    echo "✅ Coverage reports cleaned"
fi

# Optional: Clean history folder (uncomment if you want to remove it)
# if [ -d ".history" ]; then
#     echo "📜 Cleaning history folder..."
#     rm -rf .history
#     echo "✅ History folder cleaned"
# fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "To rebuild the project, run:"
echo "  npm run build"

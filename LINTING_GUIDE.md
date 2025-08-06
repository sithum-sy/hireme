# Code Quality & Linting Guide

This document provides a comprehensive guide to the code quality tools configured for this Laravel + React project.

## Overview

We use multiple linters and formatters to maintain code quality across both backend (PHP/Laravel) and frontend (JavaScript/React) codebases.

## PHP/Laravel Tools

### 1. Laravel Pint (Code Formatter)
Laravel's official code formatter based on PHP CS Fixer.

**Commands:**
```bash
# Check formatting issues (dry run)
vendor/bin/pint --test

# Fix formatting automatically
vendor/bin/pint

# Fix specific file
vendor/bin/pint app/Http/Controllers/SomeController.php

# Fix specific directory
vendor/bin/pint app/Services/
```

**Configuration:** Uses Laravel's default PSR-12 standards

### 2. PHPStan (Static Analysis)
Finds bugs and type errors in PHP code without running it.

**Commands:**
```bash
# Run analysis
vendor/bin/phpstan analyse

# Run with progress bar
vendor/bin/phpstan analyse --progress

# Analyze specific path
vendor/bin/phpstan analyse app/Services/

# Generate baseline (ignore current errors)
vendor/bin/phpstan analyse --generate-baseline
```

**Configuration:** `phpstan.neon`
- Level 5 analysis (good balance of strictness)
- Excludes problematic Laravel files
- Ignores common Laravel dynamic method calls

## JavaScript/React Tools

### 3. ESLint (Code Linting)
Finds and fixes problems in JavaScript and React code.

**Commands:**
```bash
# Lint JavaScript/React files
npm run lint

# Lint with auto-fix
npm run lint:fix

# Lint specific file
npx eslint resources/js/components/SomeComponent.jsx

# Lint with detailed output
npx eslint resources/js --format=detailed
```

**Configuration:** `eslint.config.js`
- React plugin enabled
- Browser globals configured (localStorage, setTimeout, etc.)
- Modern ES2024 syntax support
- Warns on unused variables and missing prop types

### 4. Prettier (Code Formatter)
Automatically formats JavaScript/React code consistently.

**Commands:**
```bash
# Format all JavaScript files
npm run format

# Check if files need formatting (CI/CD)
npm run format:check

# Format specific file
npx prettier --write resources/js/components/SomeComponent.jsx

# Check specific file formatting
npx prettier --check resources/js/components/SomeComponent.jsx
```

**Configuration:** `.prettierrc`
- Single quotes for strings
- 2-space indentation
- Semicolons required
- Trailing commas in ES5 contexts

## Daily Workflow

### Before Committing Code

**PHP Files:**
```bash
# 1. Format PHP code
vendor/bin/pint

# 2. Check for type errors and bugs
vendor/bin/phpstan analyse
```

**JavaScript/React Files:**
```bash
# 1. Lint and fix issues
npm run lint:fix

# 2. Format code
npm run format
```

### CI/CD Pipeline Commands

For automated checks in your build process:

```bash
# PHP - Check formatting without fixing
vendor/bin/pint --test

# PHP - Run static analysis
vendor/bin/phpstan analyse --no-progress

# JavaScript - Lint without fixing
npm run lint

# JavaScript - Check formatting without fixing
npm run format:check
```

## Configuration Files

| Tool | Config File | Purpose |
|------|-------------|---------|
| Laravel Pint | Built-in | PHP formatting rules |
| PHPStan | `phpstan.neon` | Static analysis rules |
| ESLint | `eslint.config.js` | JavaScript/React linting |
| Prettier | `.prettierrc` | JavaScript formatting |
| Prettier | `.prettierignore` | Files to exclude from formatting |

## Common Issues & Solutions

### PHPStan Errors

**"Call to undefined method"**: Usually Laravel dynamic methods (where(), find(), etc.)
- These are ignored in our config but may still appear
- Consider adding Laravel IDE Helper: `composer require --dev barryvdh/laravel-ide-helper`

**"Access to undefined property"**: Eloquent model properties
- Add proper PHPDoc blocks to your models
- Or add specific ignores to `phpstan.neon`

### ESLint Errors

**"'localStorage' is not defined"**: Fixed in our config with browser globals

**"Missing prop validation"**: Add PropTypes or use TypeScript
```javascript
import PropTypes from 'prop-types';

Component.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func
};
```

**"Unexpected console statement"**: Remove console.log() in production code

### Prettier vs ESLint Conflicts

If you get conflicting rules:
```bash
# Install eslint-config-prettier to disable conflicting rules
npm install --save-dev eslint-config-prettier
```

## IDE Integration

### VS Code Extensions
- **PHP Intelephense** - PHP language support
- **Laravel Extension Pack** - Laravel-specific tools
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **PHP CS Fixer** - PHP formatting

### VS Code Settings
Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[php]": {
    "editor.defaultFormatter": "junstyle.php-cs-fixer"
  },
  "eslint.validate": ["javascript", "javascriptreact"],
  "php-cs-fixer.executablePath": "./vendor/bin/pint"
}
```

## Performance Tips

### Large Codebases
- Use `--parallel` flag with PHPStan for faster analysis
- Lint only changed files in pre-commit hooks
- Use `.eslintcache` to speed up ESLint (add to .gitignore)

### Pre-commit Hooks
Consider using Husky or similar to run linters automatically:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "vendor/bin/pint --test && npm run lint && npm run format:check"
    }
  }
}
```

## Troubleshooting

### Pint Not Found
```bash
# Install dev dependencies
composer install

# Or install Pint specifically
composer require laravel/pint --dev
```

### ESLint/Prettier Not Found
```bash
# Install Node dependencies
npm install

# Or install specific packages
npm install --save-dev eslint prettier
```

### Permission Issues (Linux/Mac)
```bash
# Make vendor binaries executable
chmod +x vendor/bin/pint
chmod +x vendor/bin/phpstan
```

## Updating Tools

Keep your linting tools up to date:

```bash
# Update PHP tools
composer update laravel/pint phpstan/phpstan

# Update JavaScript tools
npm update eslint prettier eslint-plugin-react
```

---

**Remember:** Consistent code style makes your codebase more maintainable and helps prevent bugs. Run these tools regularly, especially before committing code!
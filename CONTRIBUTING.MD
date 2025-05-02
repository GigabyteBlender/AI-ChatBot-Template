# Contributing to AI Chatbot

First off, thank you for considering contributing to the AI Chatbot project! It's people like you that make this project better for everyone. This document provides guidelines and steps for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Issues](#issues)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
  - [JavaScript/React Style Guide](#javascriptreact-style-guide)
  - [CSS Guidelines](#css-guidelines)
  - [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)
- [Review Process](#review-process)
- [Community](#community)

## Code of Conduct

By participating in this project, you are expected to uphold the usual code of conduct. Please report unacceptable behavior to [pertu.works@gmail.com](mailto:pertu.works@gmail.com).

## Getting Started

### Issues

- **Bug Reports**: Use the bug report template to provide detailed information about the issue.
- **Feature Requests**: Use the feature request template to suggest new functionality.
- **Questions**: For general questions, please use the discussions tab instead of issues.

Before submitting a new issue:

1. Search existing issues to avoid duplicates
2. If you find a related issue, add your information as a comment
3. Only create a new issue if necessary

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request against the `main` branch

For major changes, please open an issue first to discuss what you would like to change.

## Development Setup

1. Clone your fork of the repository
   ```bash
   git clone https://github.com/GigabyteBlender/AI-Chatbot-Template.git
   ```

2. Add the original repository as upstream
   ```bash
   git remote add upstream https://github.com/GigabyteBlender/AI-Chatbot-Template.git
   ```

3. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create your environment file
   ```bash
   cp .env.example .env
   # Edit .env with necessary values
   ```

5. Start development server
   ```bash
   npm start
   # or
   yarn start
   ```

## Coding Guidelines

### JavaScript/React Style Guide

We follow a modified version of the Airbnb JavaScript Style Guide:

- Use functional components with hooks rather than class components
- Use named exports instead of default exports where possible
- Organize imports in the following order:
  1. React and React-related libraries
  2. Third-party libraries
  3. Project components
  4. Utilities, hooks, and contexts
  5. Assets and styles

Example component structure:
```jsx
// External libraries
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Project components
import Button from '../Shared/Button';

// Hooks and utilities
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

// Styles
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  // State, effects, and logic
  
  // Component functions
  
  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

ComponentName.defaultProps = {
  prop2: 0,
};

export default ComponentName;
```

### CSS Guidelines

- Use semantic class names following BEM (Block Element Modifier) methodology
- Keep specificity low when possible
- Use variables for colors, spacing, and other reusable values

### Commit Messages

We follow the Conventional Commits specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(auth): add Google sign-in option
fix(chat): resolve message duplication issue
docs: update API integration instructions
```

## Testing

- Write tests for new features and bug fixes
- Run tests before submitting a pull request
- Aim for good test coverage

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm test -- --watch
```

## Documentation

- Update the README.md if you change functionality
- Document new features with examples
- Comment complex code sections
- Update JSDoc comments for functions and components

## Review Process

1. I will review your PR
2. I might ask for changes or clarification
3. Once approved, it will merge your PR
4. Your contribution will be part of the next release

---

Again, thank you for contributing to AI Chatbot! Your support and involvement are greatly appreciated.
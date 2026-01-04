# Third-Party License Notice

**Purpose**: Summary of third-party licenses used in KEYS repository

---

## Overview

This repository includes third-party code and dependencies, each with its own license. This notice summarizes the licenses but does not replace the full license texts.

---

## Dependencies

### Node.js Dependencies

Most dependencies use **MIT License**:

- React, Next.js, TypeScript
- Testing frameworks (Vitest, Playwright)
- Build tools and utilities

### Backend Dependencies

Most dependencies use **MIT License**:

- Express, Node.js runtime
- Database drivers (PostgreSQL)
- Authentication libraries

### Development Dependencies

Most dependencies use **MIT License**:

- ESLint, Prettier
- Type checking tools
- Build tools

---

## License Types

### MIT License

**Most Common**: Used by majority of dependencies

**Rights**:
- Use, modify, distribute
- Private and commercial use
- Sublicense

**Requirements**:
- Include copyright notice
- Include license text

### Apache-2.0 License

**Some Dependencies**: Used by some packages

**Rights**:
- Use, modify, distribute
- Private and commercial use
- Patent grant

**Requirements**:
- Include copyright notice
- Include license text
- State changes (if modified)

---

## License Files

Full license texts are available in:

- **Node Modules**: `/frontend/node_modules/<package>/LICENSE`
- **Backend Modules**: `/backend/node_modules/<package>/LICENSE`
- **Package Files**: Individual packages may include license in `package.json`

---

## No GPL Dependencies

We ensure **no GPL-licensed dependencies** in core application code to avoid license contamination. All dependencies use permissive licenses (MIT, Apache-2.0) compatible with commercial licensing.

---

## Attribution

We respect all third-party licenses and maintain proper attribution:

- License notices preserved in dependency files
- Copyright notices maintained
- License texts included in distributions

---

## Questions

For questions about third-party licenses:
- Check individual package `package.json` files
- Review license files in `node_modules/`
- Consult package maintainers

---

## Version History

- **1.0.0** (2025-01-XX): Initial third-party license notice

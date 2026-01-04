# Commercial Licensing Model

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX  
**Purpose**: Define licensing boundaries for public repository with commercial resale protection

---

## Overview

The KEYS repository uses a **source-available / commercial** licensing approach:

- **Public Repository**: Source code is visible to all viewers
- **Commercial License Required**: Commercial use/resale requires a commercial license
- **Read-Only Rights**: Viewers can read code but not use commercially without license
- **Customer Grants**: Commercial licenses granted upon purchase

---

## What Is Proprietary

### Our Original Content

The following are proprietary to KEYS and require a commercial license for commercial use:

1. **Runbook Keys** (`/keys-assets/runbook-keys/`)
   - Operational runbooks and procedures
   - Incident response guides
   - Recovery procedures

2. **Node/Next Keys** (`/keys-assets/node-next-keys/`)
   - Runtime integration keys
   - Application components and handlers
   - Source code implementations

3. **Jupyter Keys** (notebook repository)
   - Structured notebook packs
   - Analysis workflows
   - Data science patterns

4. **Keys Application Code** (`/backend/`, `/frontend/`)
   - Marketplace platform
   - Discovery system
   - Entitlement management

5. **Documentation** (`/docs/`)
   - Product documentation
   - Architecture guides
   - Implementation specifications

### License Grant

**Viewing Rights**: Anyone can view the public repository  
**Commercial Use**: Requires commercial license granted upon purchase

---

## Rights Granted to Public Repository Viewers

### What Viewers CAN Do

- ✅ **View** all source code and documentation
- ✅ **Learn** from code examples and patterns
- ✅ **Contribute** improvements (subject to contribution agreement)
- ✅ **Report** issues and bugs

### What Viewers CANNOT Do

- ❌ **Use commercially** without a commercial license
- ❌ **Resell** assets or code without authorization
- ❌ **Redistribute** as part of competing products
- ❌ **Remove** attribution or license notices

---

## Commercial License Grant

### How Customers Receive Commercial License

Upon purchase of KEYS assets:

1. **Purchase**: Customer purchases asset via Stripe checkout
2. **Entitlement**: Entitlement recorded in KEYS database
3. **License Grant**: Commercial license automatically granted
4. **Usage Rights**: Customer can use asset commercially per terms

### Commercial License Terms

- **Use**: Customer can use purchased assets in commercial projects
- **Modify**: Customer can modify assets for their use
- **Ownership**: Customer owns modifications (not original asset)
- **Redistribution**: Customer cannot redistribute original asset
- **Resale**: Customer cannot resell original asset

---

## Third-Party Licenses

### Dependencies

Third-party dependencies maintain their own licenses:

- **MIT**: Most dependencies (React, Next.js, etc.)
- **Apache-2.0**: Some dependencies
- **Other**: See individual package licenses

### License Compatibility

We ensure:
- No GPL dependencies in core app (to avoid contamination)
- Compatible licenses for commercial use
- Clear attribution of third-party code

See: [`/NOTICE.md`](../../NOTICE.md) for third-party license summary

---

## Contributions

### Contributor License Agreement

Contributors must agree:

1. **Ownership**: Contributions become part of KEYS proprietary content
2. **License**: KEYS can license contributions commercially
3. **Warranty**: Contributors warrant they have rights to contribute

### Contribution Process

1. **Fork**: Contributor forks repository
2. **Contribute**: Makes changes
3. **Submit**: Opens pull request
4. **Agree**: Implicitly agrees to contribution terms
5. **Merge**: KEYS merges and gains commercial rights

---

## Asset-Specific Licensing

### Runbook Keys

**License**: MIT (per `LICENSE.txt` in each runbook)  
**Commercial Use**: Requires commercial license for commercial use  
**Note**: MIT license allows use, but commercial license grants commercial resale rights

### Node/Next Keys

**License**: MIT (per `LICENSE.txt` in each key)  
**Commercial Use**: Requires commercial license for commercial use  
**Note**: MIT license allows use, but commercial license grants commercial resale rights

### Jupyter Keys

**License**: Defined in notebook repository  
**Commercial Use**: Requires commercial license for commercial use

---

## Enforcement

### How We Protect Commercial Rights

1. **Source-Available**: Code is visible but commercial use requires license
2. **Entitlement System**: Stripe-gated downloads track commercial licenses
3. **Terms of Service**: Clear terms define commercial use boundaries
4. **Legal Protection**: Commercial license terms enforceable via contract

### Violations

Violations of commercial licensing:
- Using assets commercially without license
- Reselling assets without authorization
- Redistributing assets as competing products

---

## License Boundaries

### What Is NOT Proprietary

- **Third-party code**: Maintains original licenses
- **Open standards**: Public specifications and standards
- **Public domain**: Content explicitly in public domain

### What IS Proprietary

- **Our original code**: All code we wrote
- **Our documentation**: All documentation we created
- **Our assets**: Runbooks, keys, notebooks we created

---

## Dual Licensing Approach

### Repository License

**Current**: MIT License (allows viewing and learning)  
**Commercial Use**: Requires separate commercial license grant

### Commercial License Grant

**Granted**: Upon purchase via Stripe  
**Scope**: Commercial use rights for purchased assets  
**Term**: Perpetual (as long as customer maintains entitlement)

---

## Summary

- **Public Repository**: Source-available, visible to all
- **Commercial License**: Required for commercial use/resale
- **Customer Grants**: Automatic upon purchase
- **Third-Party**: Maintains original licenses
- **Contributions**: Become part of proprietary content

---

## References

- **Root LICENSE**: [`/LICENSE`](../../LICENSE)
- **NOTICE**: [`/NOTICE.md`](../../NOTICE.md) - Third-party licenses
- **Terms of Service**: [`/docs/TERMS_OF_SERVICE.md`](../TERMS_OF_SERVICE.md)

---

## Version History

- **1.0.0** (2025-01-XX): Initial commercial licensing model definition

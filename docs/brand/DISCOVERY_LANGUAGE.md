# Discovery Language Guide

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX  
**Status**: Active — Governs onboarding and discovery messaging  
**Purpose**: Language for explaining discovery, recommendations, and onboarding flows

---

## Core Principle

Discovery must be **explicit, transparent, and user-controlled**. Never imply surveillance. Never imply automation without consent.

---

## Onboarding Language

### First-Time Visitor

**Message:**
```
Welcome to KEYS

You already have the tools. Here are the keys to unlock them.

KEYS is a marketplace of structured assets that unlock practical capability 
in Cursor, Jupyter, GitHub, Stripe, and more. You don't need to migrate anything— 
keys work with tools you already own.
```

**Key Points:**
- Emphasize "you already have the tools"
- Explain that keys unlock capability, don't replace tools
- Clarify no migration required
- Set expectation: keys integrate into existing workflows

---

### Profile Setup

**Purpose Explanation:**
```
Help us recommend keys for your workflow

Tell us which tools you use and what you're building. We'll suggest keys 
that unlock capability in your tools. You can always skip this and browse manually.
```

**Language Rules:**
- ✅ "Help us recommend" (collaborative, not surveillance)
- ✅ "Suggest keys" (not "automatically add")
- ✅ "You can always skip" (user control)
- ❌ "We'll track your usage" (surveillance language)
- ❌ "Automatically unlock" (no automation without consent)

---

### Tool Selection

**Prompt:**
```
Which tools do you use?

Select the tools you already have. We'll suggest keys that unlock capability in these tools.

- Cursor
- Jupyter
- GitHub
- Stripe
- Supabase
- Other
```

**Language:**
- ✅ "Tools you already have" (emphasizes existing ownership)
- ✅ "We'll suggest" (not "we'll add")
- ❌ "Tools you want to use" (keys unlock existing tools, not aspirational ones)

---

### Intent Selection

**Prompt:**
```
What are you building?

Tell us what you're working on. We'll suggest keys that unlock relevant patterns.

- SaaS product
- Data analysis project
- Automation workflows
- Operational runbooks
- Other
```

**Language:**
- ✅ "What are you building" (outcome-focused)
- ✅ "We'll suggest keys" (recommendation, not automation)
- ❌ "What do you need" (too vague)
- ❌ "What problems do you have" (negative framing)

---

## Discovery Recommendations

### Recommendation Card

**Structure:**
1. Key title
2. What it unlocks (specific outcome)
3. Why it's recommended (explicit reason)
4. Confidence indicator (if applicable)

**Example:**
```
Stripe Subscription Management

Unlocks subscription billing workflows in Stripe.

Recommended because: You selected "SaaS product" as your intent.

[Unlock this Key] [Dismiss]
```

---

### Recommendation Reasons

**Allowed Reasons:**
- ✅ "Because you use [Tool]"
- ✅ "Because you're building [outcome]"
- ✅ "Because you selected [intent]"
- ✅ "Because keys like this are popular with [role]"
- ✅ "Because this complements [Key you own]"

**Forbidden Reasons:**
- ❌ "Because we're watching you" (surveillance)
- ❌ "Because AI detected" (AI hype)
- ❌ "Because you need this" (presumptuous)
- ❌ "Because everyone uses this" (peer pressure)

---

### Confidence Indicators

**Language:**
- ✅ "High confidence" (if user explicitly selected matching tool/intent)
- ✅ "Medium confidence" (if inferred from profile)
- ✅ "Low confidence" (if based on general patterns)

**Avoid:**
- ❌ "AI-powered recommendation" (AI hype)
- ❌ "Perfect match" (overpromising)
- ❌ "You'll love this" (presumptuous)

---

## Discovery Surfaces

### Homepage Recommendations

**Heading:**
```
Recommended Keys for You

Based on your profile, here are keys that might unlock capability in your workflow.
```

**Language:**
- ✅ "Might unlock" (not guaranteed)
- ✅ "Based on your profile" (explicit source)
- ✅ "For your workflow" (user-focused)
- ❌ "Perfect for you" (overpromising)
- ❌ "You need these" (presumptuous)

---

### Marketplace Recommendations

**Section:**
```
Recommended for You

Keys that unlock capability in tools you use or outcomes you're building.
```

**Dismissal:**
- ✅ "Dismiss recommendation"
- ✅ "Not interested"
- ✅ "Hide this"
- ❌ "Stop tracking me" (implies surveillance)

---

### Email Recommendations

**Subject:**
```
Keys that unlock [outcome] in [Tool]
```

**Body:**
```
Hi [Name],

Based on your KEYS profile, here are keys that might unlock capability in your workflow:

[Key recommendations]

You can update your preferences or unsubscribe from recommendations anytime.
```

**Language:**
- ✅ "Based on your profile" (explicit source)
- ✅ "Might unlock" (not guaranteed)
- ✅ "Update preferences" (user control)
- ❌ "We noticed you" (surveillance language)
- ❌ "You should try" (presumptuous)

---

## Discovery Analytics

### What to Track (Transparently)

- Tool selections (explicit user input)
- Intent selections (explicit user input)
- Recommendation clicks (user action)
- Dismissals (user preference)

### What NOT to Track (Without Consent)

- Browser history
- External tool usage
- File contents
- Private data

### Language for Analytics Disclosure

**Privacy Policy Section:**
```
Discovery Recommendations

KEYS recommends keys based on:
- Tools you explicitly select in your profile
- Intent you specify during onboarding
- Keys you've previously unlocked
- Recommendation clicks and dismissals

We do not track:
- Your browser history
- External tool usage
- File contents
- Private data

You can disable recommendations or update your profile anytime.
```

---

## Discovery Controls

### User Controls

**Settings:**
```
Discovery Preferences

- Enable recommendations: [Toggle]
- Recommend based on profile: [Toggle]
- Recommend based on key usage: [Toggle]
- Email recommendations: [Toggle]

[Save Preferences]
```

**Language:**
- ✅ "Enable recommendations" (user choice)
- ✅ "Based on [explicit source]" (transparent)
- ❌ "Smart recommendations" (vague)
- ❌ "AI-powered suggestions" (AI hype)

---

## Discovery Explanations

### Why This Key?

**Tool Match:**
```
This Key unlocks capability in Cursor, which you selected as a tool you use.
```

**Intent Match:**
```
This Key unlocks SaaS subscription patterns, which matches your "SaaS product" intent.
```

**Complementary:**
```
This Key complements [Key you own] and unlocks related capability.
```

**Popular:**
```
This Key is popular with developers building SaaS products.
```

---

## Discovery Mistakes to Avoid

### ❌ Surveillance Language

- "We're watching your workflow"
- "We detected you use [Tool]"
- "Based on your activity"
- "We noticed you"

**Replace with:**
- "Based on your profile"
- "You selected [Tool]"
- "Based on your selections"
- "You specified [intent]"

---

### ❌ Automation Language

- "We'll automatically add keys"
- "Keys will be unlocked for you"
- "We'll set this up automatically"

**Replace with:**
- "We'll suggest keys"
- "You can unlock keys"
- "You can set this up"

---

### ❌ Presumptuous Language

- "You need this"
- "Perfect for you"
- "You'll love this"
- "Everyone uses this"

**Replace with:**
- "This might unlock capability"
- "This could be useful"
- "This is popular"
- "This complements your workflow"

---

## Version History

- **1.0.0** (2025-01-XX): Initial discovery language guide

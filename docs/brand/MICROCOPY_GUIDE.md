# Microcopy Guide

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX  
**Status**: Active — Governs all UI microcopy  
**Purpose**: Standardized language for UI states, error messages, empty states, and user feedback

---

## Core Principle

Microcopy must **never shame the user, never imply user error when it's system state, and always explain what's happening**.

---

## Locked vs. Unlocked States

### Locked State

**Language:**
```
This Key is locked

Unlock this Key to download and use it in your projects.

[Unlock Key] [View Details]
```

**Rules:**
- ✅ "Locked" (not "unavailable" or "restricted")
- ✅ "Unlock" (not "purchase" or "buy"—though purchase may be the action)
- ✅ Explain what unlocking enables
- ❌ "You don't have access" (implies user error)
- ❌ "This Key is not for you" (exclusionary)

---

### Unlocked State

**Language:**
```
This Key is unlocked

Download this Key to integrate it into your project.

[Download Key] [View Documentation]
```

**Rules:**
- ✅ "Unlocked" (clear state)
- ✅ "Download" (action available)
- ✅ Provide next steps
- ❌ "You own this" (users own access, not keys)
- ❌ "Purchased" (focus on access, not transaction)

---

## Upgrade Prompts

### Language

**Format:**
```
Upgrade to unlock [capability]

Your current plan includes [current capabilities]. Upgrade to [plan name] 
to unlock [additional capabilities].

[Upgrade] [View Plans] [Dismiss]
```

**Rules:**
- ✅ Explain what upgrade unlocks
- ✅ Acknowledge current capabilities
- ✅ Provide clear upgrade path
- ❌ "You need to upgrade" (presumptuous)
- ❌ "Your plan is insufficient" (shaming)
- ❌ "Upgrade now!" (urgent/pushy)

**Example:**
```
Upgrade to unlock all keys

Your Starter plan includes 3 keys. Upgrade to Pro to unlock unlimited keys 
and access to all bundles.

[Upgrade to Pro] [View Plans] [Maybe Later]
```

---

## Error Messages

### Access Denied

**Language:**
```
You don't have access to this Key

Unlock this Key to download and use it. You can purchase it individually 
or unlock it through a bundle or subscription.

[Unlock Key] [View Plans] [Browse Other Keys]
```

**Rules:**
- ✅ Explain why access is denied
- ✅ Provide clear path to access
- ✅ Offer alternatives
- ❌ "Access denied" (too generic)
- ❌ "You can't access this" (negative framing)
- ❌ "This Key is not available to you" (exclusionary)

---

### Download Failed

**Language:**
```
Download failed

We couldn't download this Key. This might be due to a network issue or 
temporary service problem.

[Try Again] [Contact Support]
```

**Rules:**
- ✅ Explain what failed
- ✅ Suggest possible causes (system, not user)
- ✅ Provide retry option
- ❌ "Your download failed" (implies user error)
- ❌ "Download error" (too generic)
- ❌ "Something went wrong" (unhelpful)

---

### Payment Failed

**Language:**
```
Payment could not be processed

We couldn't process your payment. This might be due to an issue with your 
payment method or a temporary service problem.

[Try Again] [Update Payment Method] [Contact Support]
```

**Rules:**
- ✅ Explain what failed
- ✅ Suggest possible causes (system, not user)
- ✅ Provide clear next steps
- ❌ "Your payment failed" (implies user error)
- ❌ "Payment declined" (too negative)
- ❌ "Card error" (too technical)

---

## Empty States

### Empty Keyring

**Language:**
```
Your Keyring is empty

You haven't unlocked any keys yet. Browse the marketplace to discover keys 
that unlock capability in your tools.

[Browse Marketplace] [Set Up Profile]
```

**Rules:**
- ✅ Acknowledge empty state
- ✅ Explain why it's empty (neutral)
- ✅ Provide clear next steps
- ❌ "You have no keys" (negative framing)
- ❌ "Get started by purchasing keys" (too pushy)
- ❌ "Nothing here" (unhelpful)

---

### No Search Results

**Language:**
```
No keys found

We couldn't find any keys matching your search. Try adjusting your filters 
or browse all keys.

[Clear Filters] [Browse All Keys]
```

**Rules:**
- ✅ Explain why no results
- ✅ Suggest actions (adjust filters, not "search better")
- ✅ Provide alternatives
- ❌ "No results" (too generic)
- ❌ "Nothing matches your search" (implies user error)
- ❌ "Try a different search" (implies user did it wrong)

---

### No Recommendations

**Language:**
```
No recommendations available

We don't have any recommendations for you right now. This might be because 
your profile is new or you haven't specified your tools and intent yet.

[Set Up Profile] [Browse Marketplace]
```

**Rules:**
- ✅ Explain why no recommendations
- ✅ Provide setup path
- ✅ Offer alternative (browse manually)
- ❌ "We can't recommend anything" (implies failure)
- ❌ "Complete your profile to get recommendations" (too prescriptive)

---

## Loading States

### Language

**Use:**
- ✅ "Loading keys..."
- ✅ "Loading marketplace..."
- ✅ "Loading your Keyring..."
- ✅ "Downloading Key..."
- ✅ "Processing..."

**Avoid:**
- ❌ "Loading..." (too generic)
- ❌ "Please wait" (unhelpful)
- ❌ "Just a moment" (too casual)
- ❌ "Almost there" (false progress)

**With Progress:**
```
Downloading Key... 45%

Downloading key files. This may take a few moments.
```

---

## Success Messages

### Language

**Format:**
```
[Action] successful

[What happened]. [Next steps available].

[Next Action] [Dismiss]
```

**Rules:**
- ✅ Confirm what happened
- ✅ Provide next steps
- ✅ Keep it brief
- ❌ "Success!" (too celebratory)
- ❌ "Done!" (too casual)
- ❌ "Perfect!" (too superlative)

**Examples:**
```
Key unlocked

This Key has been added to your Keyring. You can now download and use it 
in your projects.

[Download Key] [View Keyring]
```

```
Download complete

The Key files have been downloaded. Extract the archive and follow the 
integration guide to use this Key in your project.

[View Documentation] [Browse More Keys]
```

---

## Form Validation

### Language

**Format:**
```
[Field label]

[Help text explaining what's needed]

[Error message if invalid]
```

**Rules:**
- ✅ Explain what's needed (before error)
- ✅ Error messages explain what's wrong
- ✅ Suggest how to fix
- ❌ "Invalid" (too generic)
- ❌ "Error" (unhelpful)
- ❌ "You entered this wrong" (shaming)

**Examples:**
```
Email

We'll use this to send you updates and recommendations.

[If invalid]: Please enter a valid email address.
```

```
Tool Selection

Select the tools you already use. We'll suggest keys that unlock capability 
in these tools.

[If empty]: Please select at least one tool to get started.
```

---

## Confirmation Dialogs

### Language

**Format:**
```
[Action]?

[Explanation of what will happen]. [Consequences or next steps].

[Confirm] [Cancel]
```

**Rules:**
- ✅ Explain what will happen
- ✅ Mention consequences if relevant
- ✅ Use clear action labels
- ❌ "Are you sure?" (too vague)
- ❌ "This cannot be undone" (too negative)
- ❌ "Warning!" (too alarming)

**Examples:**
```
Unlock this Key?

This Key will be added to your Keyring and you'll be charged $99. 
You'll have perpetual access to download and use this Key.

[Unlock Key] [Cancel]
```

```
Remove from Keyring?

This Key will be removed from your Keyring. You'll need to unlock it again 
to download it in the future. Your previous downloads are not affected.

[Remove] [Cancel]
```

---

## Tooltips

### Language

**Format:**
```
[Brief explanation of what this does or means]
```

**Rules:**
- ✅ One sentence max
- ✅ Explain, don't describe
- ✅ Use plain language
- ❌ "Click here to..." (obvious)
- ❌ "This is..." (too vague)

**Examples:**
```
Adds this Key to your Keyring for download
```

```
Unlocks subscription billing workflows in Stripe
```

---

## Notification Messages

### Language

**Format:**
```
[What happened]

[Brief explanation or next steps]
```

**Rules:**
- ✅ Brief and clear
- ✅ Actionable if needed
- ✅ Dismissible
- ❌ "Alert!" (too alarming)
- ❌ "Important!" (too urgent)
- ❌ Long paragraphs

**Examples:**
```
Key unlocked

This Key has been added to your Keyring.
```

```
Profile updated

Your preferences have been saved. Recommendations will update shortly.
```

---

## Version History

- **1.0.0** (2025-01-XX): Initial microcopy guide

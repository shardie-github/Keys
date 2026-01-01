# TERMS OF SERVICE
**Keys: Never Ship Insecure Code Again**

**Last Updated:** December 30, 2024  
**Effective Date:** December 30, 2024

---

## 1. ACCEPTANCE OF TERMS

By accessing or using Keys ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service.

---

## 2. SERVICE DESCRIPTION

Keys is an institutional memory system that prevents developers from shipping insecure code. The Service includes:

- **AI Output Generation:** Personalized AI outputs tailored to your role, stack, and style
- **Failure Pattern Tracking:** Automatic tracking of failures to prevent repeat mistakes
- **Safety Enforcement:** Automatic security, compliance, and quality checking
- **Pattern Recognition:** ML-powered pattern matching to prevent known failures
- **Integrations:** IDE and CI/CD integrations for workflow dependency

---

## 3. SUBSCRIPTION TIERS AND PRICING

### 3.1 Free Tier
- **Price:** $0/month
- **Limits:** 50 AI runs/month, 50K tokens/month, 5 templates, 2 exports
- **Guarantees:** None (basic safety checks only)
- **Support:** Community support

### 3.2 Pro Tier
- **Price:** $29/month
- **Limits:** 1,000 AI runs/month, 1M tokens/month, 100 templates, 50 exports
- **Guarantees:** Security, Compliance, Quality (see Section 4)
- **Support:** Priority support

### 3.3 Pro+ Tier
- **Price:** $79/month
- **Limits:** 5,000 AI runs/month, 5M tokens/month, unlimited templates/exports
- **Guarantees:** Security, Compliance, Quality (see Section 4)
- **Integrations:** IDE (VS Code/Cursor), CI/CD (GitHub Actions)
- **Support:** Priority support

### 3.4 Enterprise Tier
- **Price:** Custom pricing (starting at $500/month)
- **Limits:** Unlimited runs, tokens, templates, exports
- **Guarantees:** Security, Compliance, Quality, SLA (see Section 4)
- **Integrations:** All integrations included
- **Usage-Based Pricing:** $0.10 per prevented failure (optional)
- **Support:** Dedicated support, SLA guarantee

---

## 4. GUARANTEES AND LIABILITY

### 4.1 Security Guarantee (Pro, Pro+, Enterprise)

**Guarantee:** Keys guarantees that all AI-generated outputs are automatically scanned for security vulnerabilities including but not limited to:
- SQL injection vulnerabilities
- Cross-site scripting (XSS) vulnerabilities
- Cross-site request forgery (CSRF) vulnerabilities
- Authentication bypass vulnerabilities
- Secret exposure vulnerabilities
- Insecure dependency vulnerabilities

**Liability:** If Keys fails to detect a security vulnerability in an output that is subsequently deployed and causes a security incident, Keys will be liable for:
- Direct damages up to the amount paid by the customer in the 12 months preceding the incident
- Costs of remediation, notification, and credit monitoring (if applicable)
- Maximum liability: $100,000 per incident for Pro/Pro+ tiers, $1,000,000 per incident for Enterprise tier

**Limitations:** This guarantee does not apply to:
- Vulnerabilities introduced by customer modifications to outputs
- Vulnerabilities in third-party dependencies not scanned by Keys
- Vulnerabilities that exist in customer's existing codebase
- Zero-day vulnerabilities not yet known to the security community

### 4.2 Compliance Guarantee (Pro, Pro+, Enterprise)

**Guarantee:** Keys guarantees that all AI-generated outputs meet GDPR, SOC 2, and HIPAA compliance standards where applicable, including:
- Data privacy requirements
- Access control requirements
- Audit logging requirements
- Data retention requirements

**Liability:** If Keys fails to ensure compliance and the customer incurs fines or penalties, Keys will be liable for:
- Direct fines and penalties up to the amount paid by the customer in the 12 months preceding the violation
- Costs of compliance remediation
- Maximum liability: $100,000 per violation for Pro/Pro+ tiers, $1,000,000 per violation for Enterprise tier

**Limitations:** This guarantee does not apply to:
- Compliance violations introduced by customer modifications to outputs
- Compliance requirements specific to customer's industry not covered by standard frameworks
- Compliance violations that exist in customer's existing codebase

### 4.3 Quality Guarantee (Pro, Pro+, Enterprise)

**Guarantee:** Keys guarantees that all AI-generated outputs meet code quality standards including:
- Code smells detection
- Anti-pattern detection
- Best practice enforcement
- Performance optimization
- Maintainability standards

**Liability:** If Keys fails to ensure quality and the customer incurs technical debt or refactoring costs, Keys will be liable for:
- Direct costs of refactoring up to the amount paid by the customer in the 12 months preceding the quality issue
- Maximum liability: $50,000 per quality issue for Pro/Pro+ tiers, $500,000 per quality issue for Enterprise tier

**Limitations:** This guarantee does not apply to:
- Quality issues introduced by customer modifications to outputs
- Quality standards specific to customer's codebase not covered by standard best practices
- Quality issues that exist in customer's existing codebase

### 4.4 SLA Guarantee (Enterprise Only)

**Guarantee:** Keys guarantees 99.9% uptime for the Service.

**Liability:** If Keys fails to meet the 99.9% uptime guarantee, Keys will refund 10% of the monthly subscription fee for each percentage point below 99.9% uptime.

**Example:** If uptime is 98.9% (1 percentage point below 99.9%), Keys will refund 10% of the monthly fee. If uptime is 97.9% (2 percentage points below), Keys will refund 20% of the monthly fee.

**Limitations:** This guarantee does not apply to:
- Scheduled maintenance (with 48-hour notice)
- Force majeure events
- Customer-caused outages
- Third-party service outages (LLM providers, cloud infrastructure)

---

## 5. DATA RETENTION AND EXPORT

### 5.1 Data Retention
- **Failure Patterns:** Retained for 7 years for compliance purposes
- **Success Patterns:** Retained for 7 years for compliance purposes
- **Audit Logs:** Retained for 7 years for compliance purposes
- **Chat History:** Retained for 2 years, then archived

### 5.2 Data Export
- **Failure Patterns:** Can be exported as JSON (partial value - loses pattern matching)
- **Success Patterns:** Can be exported as templates (partial value - loses pattern recognition)
- **Audit Logs:** Can be exported for compliance (full value)
- **Pattern Matching Algorithms:** Proprietary and cannot be exported

### 5.3 Data Deletion
- Users can request data deletion at any time
- Deletion requests will be processed within 30 days
- Some data may be retained for compliance purposes (audit logs, failure patterns)

---

## 6. INTELLECTUAL PROPERTY

### 6.1 Service Ownership
- Keys owns all rights, title, and interest in the Service
- Pattern recognition algorithms are proprietary
- Integration code is proprietary

### 6.2 User Content
- Users retain ownership of their inputs and outputs
- Users grant Keys a license to use their data to improve the Service
- Users grant Keys a license to use anonymized data for pattern learning

---

## 7. LIMITATIONS OF LIABILITY

### 7.1 Maximum Liability
- **Pro/Pro+ Tiers:** Maximum liability per incident: $100,000
- **Enterprise Tier:** Maximum liability per incident: $1,000,000
- **Total Liability:** Maximum total liability per year: 12x monthly subscription fee

### 7.2 Excluded Damages
Keys is not liable for:
- Indirect, incidental, or consequential damages
- Lost profits or revenue
- Loss of data (beyond what is covered by guarantees)
- Third-party claims (except as covered by guarantees)

---

## 8. TERMINATION

### 8.1 By User
- Users can cancel their subscription at any time
- Cancellation takes effect at the end of the current billing period
- No refunds for partial months (except as covered by guarantees)

### 8.2 By Keys
- Keys can terminate accounts that violate these Terms
- Keys can terminate accounts for non-payment (after 30 days notice)
- Keys will provide 30 days notice before termination (except for violations)

### 8.3 Effect of Termination
- Access to the Service will be terminated
- Data will be retained according to Section 5.1
- Data can be exported according to Section 5.2

---

## 9. DISPUTE RESOLUTION

### 9.1 Governing Law
These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.

### 9.2 Arbitration
Any disputes arising from these Terms will be resolved through binding arbitration in accordance with [Arbitration Rules].

---

## 10. CHANGES TO TERMS

Keys reserves the right to modify these Terms at any time. Material changes will be notified via email 30 days before they take effect. Continued use of the Service after changes constitutes acceptance of the new Terms.

---

## 11. CONTACT INFORMATION

For questions about these Terms, please contact:
- **Email:** legal@keys.dev
- **Support:** support@keys.dev

---

## 12. ACKNOWLEDGMENT

By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.

---

**Last Updated:** December 30, 2024

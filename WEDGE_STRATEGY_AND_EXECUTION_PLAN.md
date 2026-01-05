# Wedge Strategy & Execution Plan: Keys

## 1. The Wedge Definition

**Source of Truth:** The "Logic Injection" Wedge.

**The Persona:** The Director of Revenue Operations (RevOps) or Analytics Operations at a Series B/C company.
**Day-in-the-Life:** They are the "adult in the room" who is constantly dragged into "data trust" firefights. They spend 40% of their week manually reconciling a spreadsheet from Finance with a dashboard from Sales. They trust neither.
**The Moment of Pain:** The "Monday Morning Metrics Fight." The CRO shows a slide saying Churn is 5%. The CFO says it's 8%. The meeting stops. The Director of Ops is assigned to "figure it out." They know this means 6 hours of SQL archaeology and CSV diffing.
**The Solution (Keys):** A repository of "Verified Logic Keys" (SQL snippets, Excel formulas, Python definitions) that are *injected* directly into tools via the browser.
**The Relief (30 Days):** The Director defines "Churn (Board Definition)" *once* as a Key. When an analyst is in Metabase, they don't write SQL. They type `/keys churn-board` and the *verified, locked logic* appears. When a rep is in Salesforce, the definition is visible.
**Cost of Failure:** Continued "Data Anarchy," loss of credibility with the Board, and inevitable burnout/turnover of the Ops team.
**Success Condition:** 3 distinct teams (e.g., Finance, Sales, Data) use the *same* Key to generate a report without speaking to each other.
**Anti-Personas:**
*   **The "AI Prompt Engineer":** We are not a prompt library. We are a logic library.
*   **The Enterprise Architect:** We do not replace the Data Warehouse. We fix the "last mile" of logic.
*   **The "Knowledge Manager":** We are not a wiki. Keys are executable.

---

## 2. Before-and-After Collapsed Product Map

**Philosophy:** Shift from "Template Management" (Generic, Creative) to "Logic Injection" (Specific, Restrictive).

| Component | **BEFORE** (Template Manager) | **AFTER** (Keys Wedge) | **Action** |
| :--- | :--- | :--- | :--- |
| **Core Entity** | `Template` (Prompt, Text, Creative) | `Key` (Verified Logic: SQL, Formula, Regex) | **Refactor** & **Rename** |
| **Organization** | `Categories` / `Tags` | `Domains` (e.g., "Board Metrics", "Billing") | **Refactor** |
| **Chrome Ext** | "Inject Prompt into ChatGPT" | "Inject Logic into BI/CRM/Sheets" | **Pivot** |
| **User Roles** | User / Admin | Owner (Ops Director) / Consumer (Analyst) | **Restrict** |
| **Editor** | Markdown / Text Editor | Code Editor (SQL/Py/Excel) + "Verified" Stamp | **Enhance** |
| **Marketplace** | "Community Templates" | **REMOVED** (Internal Truth only) | **Delete** |
| **AI Features** | "Generate Prompt" | "Explain this Logic" (Secondary) | **De-emphasize** |
| **Navigation** | Explore / Trending / New | **Library** / **Usage** / **Conflicts** | **Refactor** |

**Visual Changes:**
*   Remove "Discover" and "Community" tabs.
*   Rename "Mega Prompts" to "Keys".
*   Add "Verification Status" (Draft, Verified, Deprecated) as the primary visual indicator.
*   The "Copy" button becomes an "Inject" action with audit logging.

---

## 3. Pre-Revenue KPI & Instrumentation Schema

**Objective:** Prove *Coordination* and *Standardization*.

| Metric | Definition | Capture Point | Calculation | Surfaced As |
| :--- | :--- | :--- | :--- | :--- |
| **Conflict Avoidance Count** | Number of times a Key was injected instead of manual typing. | Chrome Extension (Injection Event) | `Sum(Injection Events)` | "Manual Errors Prevented" (Dashboard) |
| **Truth Coverage** | % of core metrics (defined in onboarding) that have a Verified Key. | Backend (DB Count) | `(Verified Keys / Target Metrics) * 100` | "Governance Score" |
| **Time Saved (Est.)** | Estimated time saved by not looking up definitions. | Chrome Extension | `Injections * 5 minutes` | "Hours Returned to Ops" |
| **Trust Signal** | Frequency of "Key Verification" (User checking if logic is current). | Web App / Extension | `View Count on Key Details` | "Trust Frequency" |
| **Activation Depth** | Ops Director creates 1 Key + 1 Consumer injects it. | Backend Logs | Boolean (True/False) | "Wedge Activated" (Admin) |

**Self-Evidence:**
*   **Weekly "Relief Report" Email:** "This week, your team injected the 'ARR Definition' 14 times across Metabase and Salesforce. That's 14 potential conflicts avoided."
*   **In-App Badge:** "You saved 3 hours of reconciliation time today."

---

## 4. The 10-Minute Wedge Demo

**Context:** A Zoom call with a skeptic Director of Ops.
**Goal:** Convert "This is another tool" to "I need this control."

*   **Minute 0-2: The Pain (Implicit)**
    *   *Screen:* A chaotic Spreadsheet and a Dashboard showing different numbers for "Gross Margin".
    *   *Narrator:* "You know this moment. Board deck is due in an hour. These numbers don't match. You don't know which SQL query is right. This is your life."
    *   *Emotion:* Anxiety, Recognition.
*   **Minute 2-4: The Solution (The Key)**
    *   *Action:* Open **Keys**. Show one card: "Gross Margin (Board Approved)".
    *   *Show:* The Logic (SQL snippet). The "Verified by [Director Name]" Badge. The "Last Updated" timestamp.
    *   *Narrator:* "This is the truth. Verified once. Locked."
    *   *Emotion:* Clarity, Control.
*   **Minute 4-7: The Injection (The Magic)**
    *   *Action:* Go to Metabase (SQL Editor). Delete the messy query.
    *   *Action:* Type `/keys gross-margin`. The *exact* SQL injects instantly.
    *   *Action:* Go to a Google Sheet. Type `//keys gross-margin`. The Formula injects.
    *   *Narrator:* "Your analysts don't rewrite logic. They inject your truth. Everywhere. Instantly."
    *   *Emotion:* Relief, Awe ("It works everywhere?").
*   **Minute 7-10: The Artifact (The Receipt)**
    *   *Action:* Show the "Usage Log" in Keys. "User A injected Gross Margin in Metabase at 9:00 AM."
    *   *Action:* Export a PDF "Governance Report" showing all active Keys.
    *   *Narrator:* "You now have a map of your business logic. Forward this to the CFO. You are done."
    *   *End:* Silent screen of the "Verified" badge.
    *   *Emotion:* Confidence.

---

## 5. Objection-by-Design Matrix

| Objection | The "Sales" Counter (BANNED) | **The Product/Design Counter (IMPLEMENTED)** |
| :--- | :--- | :--- |
| **"We have a Data Catalog / dbt."** | "We integrate with dbt!" | **Design:** Keys are *snippets* (last mile), not *tables*. We inject the SQL that *queries* dbt models. We live in the browser, not the command line. |
| **"Is this another tool to manage?"** | "It's very easy to use." | **UX:** "Zero-Setup Consumer Mode." Analysts just install the extension. They never "log in" to the app; they just consume Keys via the `/` command. |
| **"Security won't like it."** | "We are SOC2 compliant." | **Architecture:** Keys stores *logic definitions* (text), NOT customer data. We never touch your database. The app clearly states: "No Database Connections Required." |
| **"What if the internet goes down?"** | "We have 99.9% uptime." | **Feature:** "Offline Mode." The Extension caches your Keys locally. Your truth is always with you. |
| **"Who owns this?"** | "Everyone collaborates!" | **Permissions:** Strict "Owner" vs. "Consumer" roles. Only the Director can verify a Key. It's not a wiki; it's a dictionary. |

---

## 6. Pre-Revenue GTM Pack

**Positioning Statement:** "Keys is the logic injection engine that eliminates data discrepancies by ensuring every team uses the exact same definitions, everywhere." (No "Platform", no "AI", no "Collaboration").

**ICP Qualification Checklist:**
*   [ ] Role: Director/Head of Ops or Analytics.
*   [ ] Pain: Mentions "reconciliation," "trust issues," or "conflicting reports" in first 5 mins.
*   [ ] Stack: Multi-tool (e.g., Salesforce + Snowflake + Excel).
*   [ ] Team Size: 3+ Analysts/Ops people (enough to create chaos).

**Disqualification Checklist:**
*   [x] Single-person team (No coordination cost).
*   [x] "We are looking for a BI tool" (We are not BI).
*   [x] "We need to clean our data first" (We fix logic, not dirty rows).
*   [x] Requesting "AI auto-generation" of metrics.

**Pilot Success Criteria:**
1.  **3 Core Keys Defined** (e.g., ARR, Churn, Active Users).
2.  **10 Injections** of those Keys in the first week.
3.  **One "Conflict Caught"** story verified by the Champion.

**Expansion Trigger:**
*   When a "Consumer" (Analyst) asks to become an "Owner" to define their own team's keys (e.g., Marketing wants to define 'MQL').

---

## 7. What We Are Now Saying No To

We are saying **NO** to the "AI Companion" identity. We are not a general-purpose productivity tool. We are saying **NO** to "Community Templates" and the "Marketplace"—business logic is proprietary, not shared. We are saying **NO** to "Chat with your Data" features; we provide the *definitions* for the data, not the chat interface. We are saying **NO** to broadly targeting individual developers or "prompt engineers." We serve the Operations Leader who needs control, not the creator who needs inspiration. We trade "Magic" for "Truth."

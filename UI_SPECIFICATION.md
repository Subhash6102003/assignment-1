# UI/UX Specification: PeopleOps Command Center

## 1. Product Context & Philosophy
- **Product Name:** PeopleOps (or DeskOps) — AI-First HR & Operations Operating System.
- **Target Audience:** HR Directors, People Operations Leads, and Founders managing companies with 20–250 employees.
- **Design DNA:** High-density, professional B2B software inspired by Linear, Stripe, and Vercel. 
- **Inviolable Anti-Slop Rules:**
  - **85/10/5 Surface Law:** 85% clean neutral canvas (#09090B or #FAFAFA), 10% structural hairline borders (#27272A or #E4E4E7), 5% high-contrast functional accent (deep indigo/blue #3B82F6 or emerald #10B981).
  - **No Decorative Slop:** No generic cartoon 3D illustrations, no pastel icon squircle grids, no unnecessary gradient pills.
  - **Tabular Figures:** All counts, serial numbers, dates, and times must strictly use monospace `tabular-nums`.
  - **Direct Human Control:** Every record must be directly editable in-place or via a slide-over inspection drawer.

---

## 2. Layout Hierarchy & Shell Architecture

### A. Top Navigation Bar (Fixed 56px)
- **Left:** Workspace Selector ("Acme Corp ▾"), Live Date & Clock (`tabular-nums`), Environment badge (`Production`).
- **Center:** Quick Search bar (`Cmd + K` / `Ctrl + K`) to search any employee, candidate, document, or asset.
- **Right:** 
  - MCP Live Connection Indicator (`🟢 MCP Socket Active — Claude Listening`).
  - Active Alert Counter (e.g., `3 pending approvals`, `2 missing compliance docs`).
  - HR Admin profile avatar with role switcher.

### B. Segmented View Switcher (Sub-Header 48px)
Clean tabbed switcher without page reloads:
1. **Attendance & Leave** (Punch corrections, leave balances, payroll inputs).
2. **Hiring Pipeline** (Interview stages, Calendly schedules, candidate outreach).
3. **Compliance & Docs** (KYC, PAN/Aadhaar verification, expiring contracts).
4. **Asset Management** (MacBooks, monitors, serials, assignment status).

---

## 3. Detailed Module Specifications

### Module 1: Attendance & Payroll Operations
- **KPI Summary Strip (Top):**
  - Present Today (`142 / 150`)
  - Missing Punches to Resolve (`4 flagged`)
  - Pending Leave Requests (`3 waiting`)
  - Overtime Hours Logged (`18.5 hrs`)
- **Main View: Missing Punch & Daily Log Table**
  - Columns: Employee Name | Date | Check-In | Check-Out | Work Hours | Status Badge | Quick Actions.
  - Statuses: `On-Time` (green), `Late` (yellow), `Missing Punch` (red alert), `On Leave` (muted slate).
  - Action Button: **"Quick Correct"** opens an inline time-picker popover to input missing punch times.
- **Side Panel / Card: Pending Leave Approvals**
  - Card list showing: Employee, Leave Type (Sick, Casual, Paid), Dates, Reason, Balance remaining.
  - One-click `Approve` (green) and `Reject` (ghost red) buttons.

### Module 2: Interview & Hiring Operations (Weekday-Aligned)
- **KPI Summary Strip (Top):**
  - Active Openings (`6 roles`)
  - Total Candidates (`48 in funnel`)
  - Scheduled This Week (`14 interviews`)
  - Target SLA Confirmed in 24h (`84% 🟢 On Track`)
- **Main View: Pipeline Board (Interactive Kanban or Typed Table)**
  - Columns / Stages: `Shortlisted` → `Outreach Sent` → `Interview Booked` → `Offer Extended`.
  - Candidate Cards:
    - Candidate Name, Target Role, Contact info (Email + WhatsApp).
    - Calendly Link badge with copy icon.
    - Countdown Pill: `Due in 4h 12m` (changes red when < 6h).
    - One-click buttons: `View Claude Draft`, `Mark Contacted`, `Advance Stage`.
- **Slide-over Drawer:** Inspect candidate, view full pre-generated email/WhatsApp messages drafted by Claude, edit message text, and click **"Send Now"**.

### Module 3: Employee Document & Compliance Tracker
- **KPI Summary Strip (Top):**
  - Fully Compliant (`138 / 150`)
  - Missing Mandatory KYC (`8 employees`)
  - Contracts Expiring Soon (`4 in 30 days`)
- **Main View: Compliance Audit Matrix Table**
  - Columns: Employee | Dept | PAN Card | Aadhaar / Gov ID | Signed NDA | Bank Info | Audit Status.
  - Status Pills: `Verified 🟢`, `Pending Review 🟡`, `Missing 🔴`, `Expiring Soon 🟠`.
  - Actions: **"Request Re-upload"** (triggers outreach template) or **"Approve Document"**.

### Module 4: IT & Physical Asset Tracker
- **KPI Summary Strip (Top):**
  - Total Hardware Assets (`184 units`)
  - Assigned & In-Use (`162 units`)
  - Available in Storage (`18 units`)
  - Under Repair / Lost (`4 units`)
- **Main View: Inventory Table**
  - Columns: Asset Tag (e.g., `LAP-MBP-089`) | Device Name | Serial Number | Category | Assigned To | Condition | Actions.
  - Category Badges: `Laptop`, `Monitor`, `Access Key`, `Mobile Test Unit`.
  - Actions: **"Reassign"**, **"Mark for Repair"**, **"Decommission"**.

---

## 4. The Human-in-the-Loop "Inspect & Edit" Drawer
Whenever any table row or candidate card is clicked:
- A smooth slide-over drawer (400px width) enters from the right in `180ms`.
- Header shows entity name and timestamp of last change (e.g., *"Updated via Claude MCP 12m ago"*).
- Every single field is an editable input (text, select, date-picker).
- Bottom action bar: **"Discard Changes"** (ghost) and **"Save Updates"** (primary solid).

---

## 5. UI Color Tokens & Typography
- **Background:** `#09090B` (Canvas), `#18181B` (Card/Surface), `#27272A` (Borders/Dividers).
- **Text:** `#FAFAFA` (Primary Headers), `#A1A1AA` (Subtext/Labels), `#71717A` (Muted timestamps).
- **State Colors:** 
  - Emerald: `#10B981` (Approved, Scheduled, Verified)
  - Amber: `#F59E0B` (Pending, Late, Expiring)
  - Crimson: `#EF4444` (Missing Punch, Unreachable, Critical)
  - Accent Indigo: `#6366F1` (Active buttons, primary selection)
- **Typography:** `Inter` or `Geist` for body; `JetBrains Mono` or `Geist Mono` for dates, counters, IDs, and serial numbers.

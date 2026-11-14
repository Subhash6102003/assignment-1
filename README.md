# LaunchPulse — Autonomous Go-to-Market (GTM) Engineer Studio

> **Volopay Product & Tech Assignment Submission**  
> *"Build a business that runs on Claude, with no AI inside it."*  
> Reviewers: `sandeep.juttuga@volopay.co`, `rosh@volopay.co`

---

## 🎯 Executive Summary & The Problem

Over **90% of new hardware, software, and D2C innovations fail in their first year**. They fail not because the engineering was deficient, but because of poor Go-to-Market execution:
1. **Flawed Pricing & Margins:** Blind price-setting without modeling margin elasticity, CAC payback, or volume tiers.
2. **Channel Paralysis:** Founders don't know whether to run creator seeding, organic build-in-public drops, or paid social ads.
3. **Execution Gap:** High-level strategic advice is rarely translated into actionable campaigns and packaging tiers.

Consulting agencies charge **\$15,000 to \$30,000/month** for GTM strategy.  
**LaunchPulse replaces the agency with Claude Desktop.**

A founder or freelance GTM engineer chats with Claude Desktop. Claude acts as the **Autonomous GTM Engineer**, synthesizing multi-channel campaigns, a 3-tier product packaging architecture, and strategic dossiers, which it commits directly to the LaunchPulse portal via the **Model Context Protocol (MCP)**. The founder adjusts pricing sliders, refines campaign tactics, and triggers real-time sales curve lifts—all with **Zero AI inside the web application**.

---

## 🏆 Volopay Assignment Compliance Matrix

| Requirement | Implementation in LaunchPulse |
| :--- | :--- |
| **"Type in Claude, something real appears in the app"** | Claude calls `create_gtm_product` or `implement_gtm_strategy` via MCP $\rightarrow$ a complete GTM Studio view appears live with 3 campaigns, 3 packaging tiers, a strategic report, and a 12-month hatched bar curve. |
| **"Human edits it in the app"** | Founders tweak retail price sliders, edit strategic report sections in-place, select currency (`$ USD`, `₹ INR`, `€ EUR`, `£ GBP`), and click **"Implement Campaign"** or **"Implement Report Recommendations"**. |
| **"Zero AI inside the app"** | Pure deterministic **FastAPI + SQLite + React 19**. **There are zero LLM API keys, zero OpenAI/Anthropic SDKs, and zero AI inference models running in the web app.** Claude Desktop acts as the intelligent client over MCP stdio. |
| **"Not a website builder or store"** | It is an enterprise GTM Engineer workspace (like Clay, but for commercial launch strategy, unit economics, and campaign execution). |
| **"Viable business model"** | Solves high-friction GTM strategy for early-stage founders and freelancers at \$79–\$199/month, saving \$15,000+ in agency retainers. |

---

## 🏗️ Architecture & System Design

```mermaid
graph TD
    User([Founder / GTM Freelancer]) -->|Prompts product concept| Claude[Claude Desktop App]
    Claude -->|Executes tool calls via stdio| MCP[LaunchPulse FastMCP Server]
    MCP -->|REST POST /api/products| Backend[FastAPI + SQLite Backend\n(Zero AI Inside)]
    Backend -->|JSON Schemas| Frontend[React 19 Studio\nTailwind v4 / Orange Theme]
    Frontend -->|Human edits price sliders & reports| Backend
    Frontend -->|3.5s Live Telemetry Sync| User
```

### The 3 Core Workspace Pillars
1. **Campaign Studio (`/campaigns`):**
   * Multi-channel tactical execution (Creator Seeding, Build-in-Public Drops, Paid Retargeting).
   * **"Implement Campaign" CTA:** Dynamically lifts the 12-month hatched bar curve by +15% and updates active sales volume in real-time.
2. **Product Plan & Pricing Architecture (`/plans`):**
   * 3-tier packaging matrix (Essential, Flagship Hero Tier in `#ff5c00`, Team Pack).
   * Interactive Margin & Elasticity Simulator (retail slider, unit cost, gross margin %, break-even units, CAC payback velocity).
   * **"Implement Tier Pricing" CTA:** Commits the optimized price point to the catalog.
3. **Claude GTM Reports (`/reports`):**
   * 4-section strategic dossier (Executive Summary, Unit Economics, 30-Day Channel Roadmap, ICP & Positioning).
   * In-place human editing: Users can refine recommendations and click Save.
   * **"Implement Report Recommendations" CTA:** Upgrades the GTM Health Score to 94/100 points.

---

## 🚀 Quick Start (One-Click)

### Option 1: 1-Click Batch Runner (Windows)
Double-click `run_all.bat` in the root folder.
* **Backend:** Runs on `http://localhost:8000`
* **Frontend:** Runs on `http://localhost:5173`

### Option 2: Docker Compose
```bash
docker compose up --build
```

---

## 🤖 Claude Desktop MCP Integration

Add this snippet to your `claude_desktop_config.json`:
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "launchpulse-gtm": {
      "command": "python",
      "args": [
        "d:/don't_know/Assignment 1/mcp-server/server.py"
      ],
      "env": {
        "LAUNCHPULSE_API_URL": "http://127.0.0.1:8000"
      }
    }
  }
}
```

### Exposed MCP Tools:
* `get_gtm_products`: Lists active products, campaigns, and reports.
* `create_gtm_product`: Onboards a product, autonomously generating 3 campaigns, 3 tiers, and a strategic report.
* `get_product_gtm_dossier`: Fetches the comprehensive GTM blueprint for any product.
* `implement_gtm_strategy`: Applies a campaign to lift the 12-month sales curve by +15%.
* `implement_report_recommendations`: Applies report findings, updating the GTM Health Score to 94/100.

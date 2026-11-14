# LaunchPulse — 5-Minute Video Pitch & Demo Script

> **Volopay Submission:** `sandeep.juttuga@volopay.co`, `rosh@volopay.co`  
> **Speaker Role:** Founder & Full-Stack Product Engineer  
> **Target Video Length:** 4 minutes 30 seconds (strictly under the 5-minute limit)

---

## 🎬 Video Recording Breakdown

| Timestamp | Phase | On-Screen Action | Key Talking Points |
|---|---|---|---|
| **0:00 – 0:45** | **The Problem & Premise** | High failure stats & \$15k agency retainers | Why 90% of products fail: bad pricing, no launch roadmap, channel paralysis. Introduce LaunchPulse: "A business that runs on Claude, with zero AI inside it." |
| **0:45 – 1:30** | **The Architecture** | System design diagram & Claude Desktop MCP | Explain the strict Zero-AI invariant: Deterministic FastAPI + SQLite + React 19. All intelligence lives inside Claude Desktop via Model Context Protocol (MCP). |
| **1:30 – 2:30** | **Live MCP Trigger: Product Onboarding** | Split-screen: Claude Desktop on left, LaunchPulse on right | Claude calls `create_gtm_product` for *ApexDesk Pro* $\rightarrow$ instantly plots on the dashboard with 3 Campaigns, 3-Tier Packaging Plan, and 4-Section Strategic Report. |
| **2:30 – 3:30** | **The 3 Core Workspace Pillars** | Walk through Campaign, Product Plan, and Report tabs | 1. **Campaigns:** Creator seeding & paid ads with **"Implement Campaign"** lifting sales curve +15%.<br>2. **Product Plan:** Dynamic price slider, margin math, and 3-tier architecture.<br>3. **Reports:** In-place human editing of strategic sections & **"Implement Report Recommendations"** boosting Health Score to 94. |
| **3:30 – 4:00** | **Telemetry, Multi-Currency & Historical Data** | Switch currencies ($ USD, ₹ INR, € EUR) & show "+ Upload Product" modal | Demonstrate multi-currency conversion, the 12-month hatched bar chart, and the option to import historical sales data vs starting from scratch. |
| **4:00 – 4:30** | **Business Model & Wrap-up** | Recap Volopay criteria & commercial defensibility | \$79–\$199/mo B2B SaaS replacing \$15,000 agency retainers. 100% compliant with the Volopay challenge. |

---

## 🎙️ Word-for-Word Video Script

### 1. Introduction & The Problem (0:00 – 0:45)
> "Hi Sandeep, Rosh, and the Volopay team.
> 
> Over 90% of new hardware innovations, e-commerce brands, and software tools fail within their first year. 
> 
> But they don't fail because the engineering was bad. They fail because of **Go-to-Market**:
> - They guess their pricing and destroy their unit margins.
> - They suffer from channel paralysis: unsure whether to do creator seeding, organic community drops, or paid ads.
> - And they lack an actionable, week-by-week execution roadmap.
> 
> Right now, founders pay **\$15,000 to \$30,000 a month** to growth agencies and GTM consultants to build launch playbooks.
> 
> That’s why we built **LaunchPulse**: an Autonomous Go-to-Market Engineer Studio that runs on Claude, with **Zero AI inside the application codebase**."

### 2. Architecture & The Zero-AI Invariant (0:45 – 1:30)
> "Let’s look at how LaunchPulse honors the core challenge requirement:
> 
> Our web application is 100% deterministic: built with **FastAPI, SQLite, and React 19 with Tailwind v4**. 
> 
> There are **zero LLM API keys, zero Anthropic or OpenAI SDKs, and zero AI inference models** running inside the web application codebase.
> 
> Instead, all reasoning and commercial intelligence resides where it belongs: inside **Claude Desktop**, connected via Anthropic’s open **Model Context Protocol (MCP)**.
> 
> Claude acts as our virtual Chief Commercial Officer and GTM Engineer, while LaunchPulse serves as the persistent, real-time command center."

### 3. Live Demo: Claude Desktop MCP Trigger (1:30 – 2:30)
> "Let’s see it live.
> 
> On the left, I have Claude Desktop. On the right, I have the LaunchPulse studio.
> 
> Suppose I’m launching **ApexDesk Pro**—a solid bamboo standing desk for developers with dual whisper motors and integrated wireless charging. Manufacturing cost is \$140.
> 
> I ask Claude Desktop:
> *'Act as my GTM Engineer. Onboard ApexDesk Pro into LaunchPulse. Manufacturing unit cost is \$140, target price is \$389. Synthesize our multi-channel campaigns, 3-tier packaging, and strategic launch dossier.'*
> 
> Watch what happens.
> 
> Claude invokes our `create_gtm_product` MCP tool. Instantly, across our studio, the complete **ApexDesk Pro Command Center** appears live!
> 
> It autonomously plotted our 12-month hatched bar analytics curve, calculated our **64% gross margin**, and set up our 3 workspace pillars."

### 4. The 3 Core Workspace Pillars & Implementation Triggers (2:30 – 3:30)
> "Now let's examine the 3 core workspace buttons built specifically for the Go-to-Market Engineer:
> 
> **First, Campaign Studio:** Claude has structured 3 distinct launch channels: Creator Seeding, Hacker News & Reddit drops, and Paid Video Retargeting. Each has a clear budget, target CPA, and timeline. 
> Notice this orange button: **'Implement Campaign'**. When I click it, LaunchPulse dynamically applies a promotional lift, shifting our 12-month hatched bar curve by +15% and recalculating our projected sales live!
> 
> **Second, Product Plan & Pricing:** Here we have our 3-tier packaging matrix—Essential Core, our Flagship Developer Edition highlighted as the Hero Tier, and our Team Studio 4-Pack. As a founder, I can drag the retail pricing slider, watch margins recalculate in real-time, and click **'Implement Tier Pricing'** to commit the change.
> 
> **Third, Claude GTM Reports:** Claude generated our complete strategic dossier: Executive Summary, Unit Economics, 30-Day Channel Roadmap, and ICP Positioning. Founders have full human-in-the-loop control: I can click **'Edit'** on any section, refine the strategy, and save it directly to the database. Clicking **'Implement Report Recommendations'** upgrades our GTM Health Score to **94 out of 100 points**!"

### 5. Multi-Currency & Real-Time Telemetry (3:30 – 4:00)
> "LaunchPulse is built for global commerce.
> 
> In the header, founders can seamlessly switch between **USD (\$ )**, **INR (₹)**, **EUR (€)**, and **GBP (£)**, with tabular numerals and exact localized conversion across every table and chart.
> 
> When onboarding a new product via the **'+ Upload Product'** button, founders can choose between starting from scratch with synthetic category benchmarks, or importing a historical 12-month sales dataset to diagnose an existing product's performance."

### 6. Commercial Viability & Conclusion (4:00 – 4:30)
> "Why is this a real business?
> 
> Every quarter, tens of thousands of founders and freelancers launch products. Instead of paying \$15,000 a month to agencies or operating blind, LaunchPulse gives them an autonomous GTM Engineer for **\$79 per month**.
> 
> It satisfies every Volopay requirement:
> 1. Type in Claude $\rightarrow$ a full GTM Command Center appears in the app.
> 2. The human reviews, edits, and implements strategies interactively.
> 3. Zero AI inside the web codebase.
> 4. Commercially defensible, production-ready product.
> 
> All code, Docker containers, and one-click startup scripts are organized in `Assignment 1`. Thank you so much!"

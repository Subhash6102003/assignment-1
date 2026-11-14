import json
import sqlite3
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from database import get_connection, init_db
from pdf_generator import generate_gtm_report_pdf
from schemas import (
    ProductCreate, ProductOut,
    CampaignCreate, CampaignOut,
    ProductPlanCreate, ProductPlanOut,
    GTMReportCreate, GTMReportOut, ReportSectionOut
)

app = FastAPI(
    title="LaunchPulse — GTM Engineer API",
    description="Deterministic GTM Backend. Zero AI inside.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# ================= PRODUCTS =================

@app.get("/api/products", response_model=List[ProductOut])
def get_products():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products ORDER BY id ASC")
    rows = cursor.fetchall()

    result = []
    for r in rows:
        p_id = r["id"]
        # Fetch campaigns
        cursor.execute("SELECT * FROM gtm_campaigns WHERE product_id = ? ORDER BY id ASC", (p_id,))
        c_rows = cursor.fetchall()
        campaigns = [
            CampaignOut(
                id=c["id"], product_id=c["product_id"], title=c["title"], channel_type=c["channel_type"],
                budget=c["budget"], target_cpa=c["target_cpa"], projected_lift_pct=c["projected_lift_pct"],
                status=c["status"], tactic=c["tactic"], timeline=c["timeline"], created_at=str(c["created_at"])
            ) for c in c_rows
        ]

        # Fetch product plans
        cursor.execute("SELECT * FROM gtm_product_plans WHERE product_id = ? ORDER BY price ASC", (p_id,))
        pp_rows = cursor.fetchall()
        plans = [
            ProductPlanOut(
                id=pp["id"], product_id=pp["product_id"], tier_name=pp["tier_name"], price=pp["price"],
                billing_frequency=pp["billing_frequency"], is_hero_tier=bool(pp["is_hero_tier"]),
                features=json.loads(pp["features_json"]) if pp["features_json"] else [],
                target_buyer=pp["target_buyer"], roadmap_phase=pp["roadmap_phase"], status=pp["status"]
            ) for pp in pp_rows
        ]

        # Fetch reports
        cursor.execute("SELECT * FROM gtm_reports WHERE product_id = ? ORDER BY id DESC", (p_id,))
        rep_rows = cursor.fetchall()
        reports = []
        for rep in rep_rows:
            rep_id = rep["id"]
            cursor.execute("SELECT * FROM gtm_report_sections WHERE report_id = ? ORDER BY section_order ASC", (rep_id,))
            sec_rows = cursor.fetchall()
            sections = [
                ReportSectionOut(id=s["id"], report_id=s["report_id"], section_order=s["section_order"], title=s["title"], content=s["content"])
                for s in sec_rows
            ]
            reports.append(GTMReportOut(
                id=rep["id"], product_id=rep["product_id"], title=rep["title"], status=rep["status"],
                view_count=rep["view_count"], last_viewed_at=str(rep["last_viewed_at"]) if rep["last_viewed_at"] else None,
                is_implemented=bool(rep["is_implemented"]), created_at=str(rep["created_at"]), sections=sections
            ))

        curve = json.loads(r["monthly_curve_json"]) if r["monthly_curve_json"] else [42, 48, 78, 65, 50, 70, 38, 52, 47, 55, 60, 72]

        result.append(ProductOut(
            id=r["id"], name=r["name"], industry=r["industry"], stage=r["stage"],
            is_existing_product=bool(r["is_existing_product"]), currency=r["currency"],
            hook=r["hook"] or "", retail_price=r["retail_price"], unit_cost=r["unit_cost"],
            projected_margin=r["projected_margin"], active_sales=r["active_sales"],
            product_revenue=r["product_revenue"], units_sold=r["units_sold"],
            conversion_rate=r["conversion_rate"], health_score=r["health_score"],
            monthly_curve=curve, created_at=str(r["created_at"]),
            campaigns=campaigns, plans=plans, reports=reports
        ))
    conn.close()
    return result

@app.post("/api/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate):
    conn = get_connection()
    cursor = conn.cursor()

    margin = round(((data.retail_price - data.unit_cost) / data.retail_price) * 100, 1) if data.retail_price > 0 else 0.0

    if data.is_existing_product and data.historical_sales:
        curve = [min(100, max(20, round((val / max(data.historical_sales)) * 95, 1))) for val in data.historical_sales[:12]]
        if len(curve) < 12:
            curve += [curve[-1]] * (12 - len(curve))
        total_rev = sum(data.historical_sales)
        active_sales = total_rev * 1.5
        units_sold = int(total_rev / data.retail_price) if data.retail_price > 0 else 1200
    else:
        # Benchmark curve for category
        curve = [38, 45, 65, 58, 52, 70, 42, 56, 50, 62, 68, 82]
        active_sales = round(data.retail_price * 65, 2)
        total_rev = round(data.retail_price * 42, 2)
        units_sold = int(active_sales / data.retail_price) if data.retail_price > 0 else 500

    cursor.execute("""
        INSERT INTO products (
            name, industry, stage, is_existing_product, currency, hook, 
            retail_price, unit_cost, projected_margin, active_sales, 
            product_revenue, units_sold, conversion_rate, health_score, monthly_curve_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.name, data.industry, data.stage, int(data.is_existing_product), data.currency, data.hook,
        data.retail_price, data.unit_cost, margin, active_sales, total_rev, units_sold, 13.2, 86, json.dumps(curve)
    ))
    product_id = cursor.lastrowid

    # 1. AUTONOMOUS GTM CAMPAIGNS GENERATION
    cpa_target = round(data.retail_price * 0.18, 1)
    budget_creator = round(data.retail_price * 4.5, 0)
    budget_paid = round(data.retail_price * 8.0, 0)

    cursor.execute("""
        INSERT INTO gtm_campaigns (product_id, title, channel_type, budget, target_cpa, projected_lift_pct, status, tactic, timeline)
        VALUES 
        (?, ?, 'Creator', ?, ?, 18.0, 'active', ?, 'Week 1-2'),
        (?, ?, 'Organic', 0.0, 0.0, 14.0, 'active', ?, 'Week 2-3'),
        (?, ?, 'Paid', ?, ?, 24.0, 'draft', ?, 'Week 3-4')
    """, (
        product_id, f"{data.name} Creator Seeding & Niche Reviews", budget_creator, cpa_target,
        f"Send 12 early-access units of {data.name} to prominent creators in {data.industry} for authentic unboxing and teardowns.",
        product_id, f"Community & Build-in-Public Launch Drops",
        f"Publish an authentic technical engineering breakdown and value thesis on Reddit, Hacker News, and industry forums emphasizing: '{data.hook}'.",
        product_id, f"High-Intent Retargeting & Video Ads", budget_paid, round(cpa_target * 1.3, 1),
        f"15-second high-velocity video demonstrations highlighting core differentiation at {data.currency} {data.retail_price}."
    ))

    # 2. AUTONOMOUS PRODUCT PACKAGING & PRICING PLANS GENERATION
    tier1_price = round(data.retail_price * 0.82, 0)
    tier2_price = data.retail_price
    tier3_price = round(data.retail_price * 3.8, 0)

    t1_features = json.dumps([f"Core {data.name} Unit", "Standard 1-Year Warranty", "Digital Quickstart Guide"])
    t2_features = json.dumps([f"Flagship {data.name} Hardware", "Priority Lifetime Firmware/Support", "3-Year Complete Replacement Warranty", "Free Global Priority Delivery"])
    t3_features = json.dumps([f"4x {data.name} Units", "Dedicated Business Account Manager", "Custom Co-branded Onboarding", "5-Year Commercial SLA"])

    cursor.execute("""
        INSERT INTO gtm_product_plans (product_id, tier_name, price, billing_frequency, is_hero_tier, features_json, target_buyer, roadmap_phase, status)
        VALUES
        (?, 'Essential Tier', ?, 'one-time', 0, ?, 'Budget-conscious early adopters', 'Phase 1: Launch', 'active'),
        (?, 'Developer & Pro Edition', ?, 'one-time', 1, ?, 'Target primary buyers & power users', 'Phase 1: Launch', 'active'),
        (?, 'Team & Commercial 4-Pack', ?, 'pack of 4', 0, ?, 'B2B teams, studios & commercial clients', 'Phase 2: Scale', 'active')
    """, (
        product_id, tier1_price, t1_features,
        product_id, tier2_price, t2_features,
        product_id, tier3_price, t3_features
    ))

    # 3. AUTONOMOUS CLAUDE GTM STRATEGIC REPORT GENERATION
    cursor.execute("""
        INSERT INTO gtm_reports (product_id, title, status, view_count, is_implemented)
        VALUES (?, ?, 'published', 1, 0)
    """, (product_id, f"{data.name} — Go-to-Market Strategic Dossier"))
    report_id = cursor.lastrowid

    sec1_content = (
        f"{data.name} addresses a pivotal market gap in {data.industry}. "
        f"The primary value hook ('{data.hook}') creates sharp category differentiation against legacy incumbents. "
        f"Initial algorithmic benchmarks indicate healthy adoption velocity with a target baseline conversion rate of 13.2%."
    )
    sec2_content = (
        f"At a retail target price of {data.currency} {data.retail_price} and estimated unit production cost of {data.currency} {data.unit_cost}, "
        f"the product commands a {margin}% gross margin. This healthy margin affords a sustainable Customer Acquisition Cost (CAC) "
        f"ceiling of up to {data.currency} {cpa_target} while maintaining a payback velocity under 16 days."
    )
    sec3_content = (
        f"• Week 1: Direct creator seeding of 12 units to key opinion leaders in {data.industry}.\n"
        f"• Week 2: Build-in-public launch drops across specialized developer and community channels.\n"
        f"• Week 3: Paid social retargeting ads focusing on high-intent cart abandoners and search traffic.\n"
        f"• Week 4: B2B outreach to volume commercial accounts offering 4-pack corporate bundles."
    )
    sec4_content = (
        f"Primary Audience: Mid-to-senior professionals in {data.industry} who prioritize uncompromised quality and reliability.\n"
        f"Key Positioning: '{data.hook}'"
    )

    cursor.execute("""
        INSERT INTO gtm_report_sections (report_id, section_order, title, content)
        VALUES
        (?, 1, '1. Executive Summary & Market Fit', ?),
        (?, 2, '2. Unit Economics & Pricing Elasticity', ?),
        (?, 3, '3. 30-Day Go-to-Market Execution Roadmap', ?),
        (?, 4, '4. ICP & Competitive Positioning', ?)
    """, (
        report_id, sec1_content,
        report_id, sec2_content,
        report_id, sec3_content,
        report_id, sec4_content
    ))

    conn.commit()
    conn.close()
    
    # Return created product with all generated child records
    all_prods = get_products()
    for p in all_prods:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=500, detail="Failed to retrieve created product")

# ================= IMPLEMENT STRATEGY (DYNAMIC GRAPH LIFT) =================

@app.post("/api/products/{product_id}/implement-campaign")
def implement_campaign(product_id: int, campaign_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT monthly_curve_json, active_sales, product_revenue FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")

    curve = json.loads(row["monthly_curve_json"]) if row["monthly_curve_json"] else [50]*12
    # Apply 15% promotional lift across remaining months
    lifted_curve = [min(100, round(v * 1.15, 1)) for v in curve]
    new_active_sales = round(row["active_sales"] * 1.15, 2)
    new_revenue = round(row["product_revenue"] * 1.15, 2)

    cursor.execute("UPDATE gtm_campaigns SET status = 'implemented' WHERE id = ? AND product_id = ?", (campaign_id, product_id))
    cursor.execute("""
        UPDATE products 
        SET monthly_curve_json = ?, active_sales = ?, product_revenue = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    """, (json.dumps(lifted_curve), new_active_sales, new_revenue, product_id))
    conn.commit()
    conn.close()
    return {"message": "Campaign implemented! Sales curve lifted by 15%.", "monthly_curve": lifted_curve, "active_sales": new_active_sales, "product_revenue": new_revenue}

@app.post("/api/products/{product_id}/implement-report")
def implement_report(product_id: int, report_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE gtm_reports SET is_implemented = 1 WHERE id = ? AND product_id = ?", (report_id, product_id))
    cursor.execute("UPDATE products SET health_score = 94, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Report recommendations implemented! Health Score updated to 94/100."}

@app.put("/api/products/{product_id}/price")
def update_product_price(product_id: int, payload: dict):
    conn = get_connection()
    cursor = conn.cursor()
    new_price = payload.get("retail_price", 389.0)
    cursor.execute("SELECT unit_cost FROM products WHERE id = ?", (product_id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
    
    margin = round(((new_price - r["unit_cost"]) / new_price) * 100, 1) if new_price > 0 else 0.0
    cursor.execute("UPDATE products SET retail_price = ?, projected_margin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_price, margin, product_id))
    conn.commit()
    conn.close()
    return {"message": "Price updated", "retail_price": new_price, "projected_margin": margin}

@app.put("/api/reports/{report_id}/sections/{section_id}")
def update_report_section(report_id: int, section_id: int, payload: dict):
    conn = get_connection()
    cursor = conn.cursor()
    content = payload.get("content", "")
    cursor.execute("UPDATE gtm_report_sections SET content = ? WHERE id = ? AND report_id = ?", (content, section_id, report_id))
    conn.commit()
    conn.close()
    return {"message": "Section updated", "report_id": report_id, "section_id": section_id}

# ================= PDF EXPORTS & ARTIFACT STORAGE =================

@app.get("/api/reports/{report_id}/export-pdf")
def export_report_pdf(report_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Fetch report
    cursor.execute("SELECT * FROM gtm_reports WHERE id = ?", (report_id,))
    rep_row = cursor.fetchone()
    if not rep_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Report not found")
        
    product_id = rep_row["product_id"]
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    prod_row = cursor.fetchone()
    if not prod_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Parent product not found")
        
    cursor.execute("SELECT * FROM gtm_report_sections WHERE report_id = ? ORDER BY section_order ASC", (report_id,))
    sec_rows = cursor.fetchall()
    sections = [
        {"title": s["title"], "content": s["content"], "order": s["section_order"]}
        for s in sec_rows
    ]
    
    prod_dict = dict(prod_row)
    rep_dict = dict(rep_row)
    rep_dict["sections"] = sections
    
    # 2. Generate PDF via ReportLab
    filepath = generate_gtm_report_pdf(prod_dict, rep_dict)
    filename = os.path.basename(filepath)
    file_size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
    
    # 3. Store record in gtm_pdf_exports
    cursor.execute("""
        INSERT INTO gtm_pdf_exports (product_id, report_id, filename, file_path, file_size_bytes)
        VALUES (?, ?, ?, ?, ?)
    """, (product_id, report_id, filename, filepath, file_size))
    conn.commit()
    conn.close()
    
    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=filename
    )

@app.get("/api/exports")
def get_pdf_exports():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM gtm_pdf_exports ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]



import sqlite3
import json
from database import get_connection, init_db

def seed():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Clear products to re-seed cleanly
    cursor.execute("DELETE FROM gtm_report_sections")
    cursor.execute("DELETE FROM gtm_reports")
    cursor.execute("DELETE FROM gtm_product_plans")
    cursor.execute("DELETE FROM gtm_campaigns")
    cursor.execute("DELETE FROM products")

    # 1. Product 1: ApexDesk Pro
    curve_1 = [42, 48, 78, 65, 50, 70, 38, 52, 47, 55, 60, 72]
    cursor.execute("""
        INSERT INTO products (
            name, industry, stage, is_existing_product, currency, hook,
            retail_price, unit_cost, projected_margin, active_sales,
            product_revenue, units_sold, conversion_rate, health_score, monthly_curve_json
        ) VALUES (
            'ApexDesk Pro', 'Ergonomic Hardware & Workspace Tech', 'pre-launch', 0, 'USD',
            'The first solid bamboo standing desk engineered specifically for developers who refuse to compromise between ergonomic spinal health and cable-free aesthetics.',
            389.0, 140.0, 64.0, 24064.0, 15490.0, 2355, 12.5, 82, ?
        )
    """, (json.dumps(curve_1),))
    p1_id = cursor.lastrowid

    # Campaigns for Product 1
    cursor.execute("""
        INSERT INTO gtm_campaigns (product_id, title, channel_type, budget, target_cpa, projected_lift_pct, status, tactic, timeline)
        VALUES 
        (?, 'Creator & Reviewer Desk Seeding', 'Creator', 1500.0, 45.0, 18.0, 'active', 'Ship 15 seed units to developer YouTubers for unsponsored ergonomic desk tours.', 'Week 1-2'),
        (?, 'Hacker News & Reddit Build-Log Drops', 'Organic', 0.0, 0.0, 12.0, 'implemented', 'Authentic mechanical walkthrough of dual whisper-motors and magnetic cable spine on r/battlestations.', 'Week 2-3'),
        (?, 'Meta & TikTok Video Retargeting', 'Paid', 3000.0, 65.0, 22.0, 'draft', '15-second silent video ads showcasing the 100W wireless Qi charging pad built into the solid bamboo desktop.', 'Week 3-4')
    """, (p1_id, p1_id, p1_id))

    # Product Plans for Product 1
    cursor.execute("""
        INSERT INTO gtm_product_plans (product_id, tier_name, price, billing_frequency, is_hero_tier, features_json, target_buyer, roadmap_phase, status)
        VALUES
        (?, 'Essential Core', 319.0, 'one-time', 0, ?, 'Budget-conscious remote workers', 'Phase 1: Launch', 'active'),
        (?, 'Developer Edition', 389.0, 'one-time', 1, ?, 'Full-time software engineers & tech creators', 'Phase 1: Launch', 'active'),
        (?, 'Team Studio 4-Pack', 1499.0, 'pack of 4', 0, ?, 'Seed/Series A Startups & Coworking Hubs', 'Phase 2: B2B Expansion', 'active')
    """, (
        p1_id, json.dumps(["Solid Bamboo Desktop (48x30)", "Dual Whisper Motors", "3-Year Warranty"]),
        p1_id, json.dumps(["Solid Bamboo Desktop (60x30)", "Dual Whisper Motors", "Integrated 100W Wireless Qi Charging Pad", "Magnetic Undermount Cable Spine", "5-Year Full Warranty"]),
        p1_id, json.dumps(["4x Developer Edition Desks", "Dedicated Account Manager", "White-glove Office Setup", "10-Year Commercial Warranty"])
    ))

    # Reports for Product 1
    cursor.execute("""
        INSERT INTO gtm_reports (product_id, title, status, view_count, is_implemented)
        VALUES (?, 'ApexDesk Pro — Q1 Go-to-Market Strategic Dossier', 'published', 4, 0)
    """, (p1_id,))
    rep1_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO gtm_report_sections (report_id, section_order, title, content)
        VALUES
        (?, 1, '1. Executive Summary & Market Fit', 'ApexDesk Pro enters the market at an ideal inflection point where corporate remote work policies have stabilized, but developer ergonomic dissatisfaction remains high. Positioning the solid bamboo aesthetic alongside integrated 100W Qi wireless charging differentiates the brand from generic clinical standing desks, capturing mid-career engineers seeking a distraction-free cable setup.'),
        (?, 2, '2. Unit Economics & Pricing Elasticity', 'At a target retail price of $389 and manufacturing cost of $140, the product yields a 64.0% gross margin. This affords a target customer acquisition cost (CAC) of up to $65 on paid channels while maintaining a 12-day cash payback velocity. Recommended 3-tier architecture: Essential ($319), Developer Edition ($389), and Team Studio 4-Pack ($1,499).'),
        (?, 3, '3. 30-Day Channel Execution Roadmap', '• Week 1: Authentic developer build-log drops on Reddit r/battlestations and Hacker News.\n• Week 2: Ship 15 seed units to developer YouTubers (The Primeagen, Typecraft) for unsponsored setup reviews.\n• Week 3: Direct B2B outreach to HR/Ops leads at Series A/B tech startups for 15% team stipend discounts.\n• Week 4: Scale Meta retargeting ads featuring 15-second silent cable-management demonstrations.')
    """, (rep1_id, rep1_id, rep1_id))

    # 2. Product 2: Lumina Sleep Mask (Existing Product Mode)
    curve_2 = [35, 50, 65, 75, 85, 92, 70, 80, 88, 95, 100, 110]
    cursor.execute("""
        INSERT INTO products (
            name, industry, stage, is_existing_product, currency, hook,
            retail_price, unit_cost, projected_margin, active_sales,
            product_revenue, units_sold, conversion_rate, health_score, monthly_curve_json
        ) VALUES (
            'Lumina Sleep Mask', 'Health & Sleep Tech D2C', 'growth', 1, 'USD',
            'Biometric blackout sleep mask with adaptive binaural soundscapes engineered to induce REM sleep in under 12 minutes.',
            179.0, 52.0, 70.9, 38420.0, 29180.0, 1840, 14.2, 92, ?
        )
    """, (json.dumps(curve_2),))
    p2_id = cursor.lastrowid

    # Campaigns for Product 2
    cursor.execute("""
        INSERT INTO gtm_campaigns (product_id, title, channel_type, budget, target_cpa, projected_lift_pct, status, tactic, timeline)
        VALUES 
        (?, 'Biohacker & Oura Ring Community Outreach', 'Organic', 0.0, 0.0, 20.0, 'implemented', 'Community discussions on sleep latency reduction and deep sleep phase tracking.', 'Week 1-2'),
        (?, 'Huberman Lab Wellness Podcast Sponsorship', 'Paid', 4500.0, 42.0, 28.0, 'active', 'Host-read mid-roll endorsement targeting executives with chronic 3 AM cortisol spikes.', 'Week 3-4')
    """, (p2_id, p2_id))

    # Product Plans for Product 2
    cursor.execute("""
        INSERT INTO gtm_product_plans (product_id, tier_name, price, billing_frequency, is_hero_tier, features_json, target_buyer, roadmap_phase, status)
        VALUES
        (?, 'Core Blackout', 129.0, 'one-time', 0, ?, 'Travelers & Light Sleepers', 'Phase 1: Direct', 'active'),
        (?, 'Biometric Audio Edition', 179.0, 'one-time', 1, ?, 'Biohackers & Stressed Executives', 'Phase 1: Direct', 'active')
    """, (
        p2_id, json.dumps(["Zero-pressure Eye Cavities", "100% Total Blackout Foam", "Washable Silk Cover"]),
        p2_id, json.dumps(["Integrated Bone Conduction Speakers", "Adaptive Binaural Soundscapes", "Cortisol Spike Sensor", "1-Year App Access"])
    ))

    # Reports for Product 2
    cursor.execute("""
        INSERT INTO gtm_reports (product_id, title, status, view_count, is_implemented)
        VALUES (?, 'Lumina Sleep Mask — Scaling & Retention GTM Dossier', 'published', 7, 1)
    """, (p2_id,))
    rep2_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO gtm_report_sections (report_id, section_order, title, content)
        VALUES
        (?, 1, '1. Performance Bottleneck Diagnosis', 'Lumina generated $29,180 in monthly product revenue, but experienced a mild 4.2% drop-off during checkout for international customers due to lack of local currency support. Implementing dynamic currency localization (INR, EUR, GBP) is projected to recapture $6,200/mo in lost sales.'),
        (?, 2, '2. Scale & Remarketing Economics', 'At $179 retail price and $52 cost, the 70.9% gross margin allows high-ticket podcast sponsorships while maintaining positive cash flow. Recommendation: Seed units to wellness physicians and sleep coaches.')
    """, (rep2_id, rep2_id))

    conn.commit()
    conn.close()
    print("Database seeded with ApexDesk Pro and Lumina Sleep Mask.")

if __name__ == "__main__":
    seed()

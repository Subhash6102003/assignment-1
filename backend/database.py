import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "launchpulse.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        industry TEXT,
        stage TEXT DEFAULT 'pre-launch', -- 'pre-launch' or 'growth'
        is_existing_product BOOLEAN DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        hook TEXT,
        retail_price REAL DEFAULT 389.0,
        unit_cost REAL DEFAULT 140.0,
        projected_margin REAL DEFAULT 64.0,
        active_sales REAL DEFAULT 24064.0,
        product_revenue REAL DEFAULT 15490.0,
        units_sold INTEGER DEFAULT 2355,
        conversion_rate REAL DEFAULT 12.5,
        health_score INTEGER DEFAULT 82,
        monthly_curve_json TEXT, -- 12 months array
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # GTM Campaigns Table (Campaign Plan Module)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gtm_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        channel_type TEXT NOT NULL, -- Organic, Paid, Creator, Direct
        budget REAL DEFAULT 0.0,
        target_cpa REAL DEFAULT 0.0,
        projected_lift_pct REAL DEFAULT 15.0,
        status TEXT DEFAULT 'draft', -- draft, active, implemented
        tactic TEXT NOT NULL,
        timeline TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
    );
    """)

    # GTM Product Plans Table (Product Plan Module)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gtm_product_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        tier_name TEXT NOT NULL,
        price REAL NOT NULL,
        billing_frequency TEXT DEFAULT 'one-time',
        is_hero_tier BOOLEAN DEFAULT 0,
        features_json TEXT,
        target_buyer TEXT,
        roadmap_phase TEXT DEFAULT 'Phase 1: Launch',
        status TEXT DEFAULT 'active',
        FOREIGN KEY (product_id) REFERENCES products (id)
    );
    """)

    # GTM Executive Reports Table (Report Module)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gtm_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'published',
        view_count INTEGER DEFAULT 0,
        last_viewed_at TIMESTAMP,
        is_implemented BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
    );
    """)

    # Report Narrative Sections Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gtm_report_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        section_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES gtm_reports (id)
    );
    """)

    # GTM PDF Exports Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gtm_pdf_exports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        report_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size_bytes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (report_id) REFERENCES gtm_reports (id)
    );
    """)

    # Users / Authentication Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Lead GTM Engineer',
        company TEXT DEFAULT 'LaunchPulse Studio',
        avatar_url TEXT DEFAULT '',
        api_key TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed demo user if empty
    import hashlib
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        demo_pass_hash = hashlib.sha256("password123".encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, company, avatar_url, api_key)
            VALUES ('Subhash Maurya', 'founder@launchpulse.ai', ?, 'Lead GTM Engineer', 'LaunchPulse Studio', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'lp_live_9a8f3b2c1d0e')
        """, (demo_pass_hash,))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema successfully updated at", DB_PATH)

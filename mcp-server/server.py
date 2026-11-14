import os
import sys
import json
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    from mcp.server.fastmcp import FastMCP
    mcp = FastMCP("LaunchPulse GTM Engineer Engine")
except (ImportError, ModuleNotFoundError):
    from mcp.server.mcpserver import MCPServer
    mcp = MCPServer("LaunchPulse GTM Engineer Engine")

API_BASE_URL = os.getenv("LAUNCHPULSE_API_URL", "http://127.0.0.1:8000")

@mcp.tool()
def create_gtm_product(
    name: str,
    industry: str,
    retail_price: float,
    unit_cost: float,
    concept_hook: str,
    is_existing_product: bool = False,
    currency: str = "USD"
) -> str:
    """
    Create a new product in the LaunchPulse GTM portal.
    Autonomously generates 3 tailored GTM Campaigns, a 3-tier Product Packaging Plan, 
    and a 4-section Claude GTM Strategic Dossier Report plotted directly on the live dashboard.
    """
    payload = {
        "name": name,
        "industry": industry,
        "retail_price": retail_price,
        "unit_cost": unit_cost,
        "hook": concept_hook,
        "is_existing_product": is_existing_product,
        "currency": currency
    }
    try:
        res = requests.post(f"{API_BASE_URL}/api/products", json=payload, timeout=10)
        if res.status_code == 201:
            data = res.json()
            return (
                f"✅ Onboarded '{name}' (ID: {data['id']}) into LaunchPulse GTM Studio!\n"
                f"- Retail Target: {currency} ${data['retail_price']} | Gross Margin: {data['projected_margin']}%\n"
                f"- Generated {len(data['campaigns'])} Campaigns: {[c['title'] for c in data['campaigns']]}\n"
                f"- Generated {len(data['plans'])} Pricing Tiers: {[p['tier_name'] for p in data['plans']]}\n"
                f"- Generated GTM Strategic Dossier with {len(data['reports'][0]['sections'])} strategic sections.\n"
                f"- 12-Month Sales Curve & Speedometer Gauge plotted live on dashboard."
            )
        return f"❌ Failed: {res.text}"
    except Exception as e:
        return f"❌ Connection error: {str(e)}"

@mcp.tool()
def implement_gtm_strategy(product_id: int, campaign_id: int) -> str:
    """
    Implement a recommended GTM campaign plan.
    Lifts the projected 12-month sales curve by 15% and updates live portal telemetry.
    """
    try:
        res = requests.post(f"{API_BASE_URL}/api/products/{product_id}/implement-campaign?campaign_id={campaign_id}", timeout=10)
        if res.status_code == 200:
            d = res.json()
            return f"✅ {d['message']} New Active Sales: ${d['active_sales']:,} | Product Revenue: ${d['product_revenue']:,}"
        return f"❌ Failed: {res.text}"
    except Exception as e:
        return f"❌ Connection error: {str(e)}"

@mcp.tool()
def implement_report_recommendations(product_id: int, report_id: int) -> str:
    """
    Implement recommendations from the Claude GTM Strategic Dossier.
    Bumps GTM Health Score to 94/100 and marks the report as implemented.
    """
    try:
        res = requests.post(f"{API_BASE_URL}/api/products/{product_id}/implement-report?report_id={report_id}", timeout=10)
        if res.status_code == 200:
            d = res.json()
            return f"✅ {d['message']}"
        return f"❌ Failed: {res.text}"
    except Exception as e:
        return f"❌ Connection error: {str(e)}"

@mcp.tool()
def get_product_gtm_dossier(product_id: int) -> str:
    """
    Retrieve the full GTM dossier for a product including its campaigns, 3-tier product packaging, and strategic report sections.
    """
    try:
        res = requests.get(f"{API_BASE_URL}/api/products", timeout=10)
        if res.status_code == 200:
            prods = res.json()
            p = next((x for x in prods if x['id'] == product_id), None)
            if not p:
                return f"❌ Product with ID {product_id} not found."
            
            dossier = f"📊 GTM DOSSIER: {p['name']} ({p['industry']})\n"
            dossier += f"Stage: {p['stage']} | Target Price: ${p['retail_price']} | Margin: {p['projected_margin']}%\n\n"
            
            dossier += "📢 CAMPAIGNS:\n"
            for c in p['campaigns']:
                dossier += f"- [{c['status'].upper()}] {c['title']} ({c['channel_type']}) | Budget: ${c['budget']} | Lift: +{c['projected_lift_pct']}%\n"
            
            dossier += "\n📦 PACKAGING & PRICING PLANS:\n"
            for pl in p['plans']:
                hero = " [HERO TIER]" if pl['is_hero_tier'] else ""
                dossier += f"- {pl['tier_name']}{hero}: ${pl['price']}/{pl['billing_frequency']} | Buyer: {pl['target_buyer']}\n"
            
            dossier += "\n📑 STRATEGIC REPORT SECTIONS:\n"
            for rep in p['reports']:
                for sec in rep['sections']:
                    dossier += f"### {sec['title']}\n{sec['content']}\n\n"
            
            return dossier
        return f"❌ Error: {res.text}"
    except Exception as e:
        return f"❌ Connection error: {str(e)}"

@mcp.tool()
def get_gtm_products() -> str:
    """List all client products, active campaigns, and reports in LaunchPulse."""
    try:
        res = requests.get(f"{API_BASE_URL}/api/products", timeout=10)
        if res.status_code == 200:
            prods = res.json()
            out = "📦 Client Products in LaunchPulse:\n"
            for p in prods:
                out += f"- ID {p['id']}: {p['name']} ({p['currency']} ${p['retail_price']}) | Margin: {p['projected_margin']}% | Campaigns: {len(p['campaigns'])} | Reports: {len(p['reports'])}\n"
            return out
        return f"❌ Error: {res.text}"
    except Exception as e:
        return f"❌ Connection error: {str(e)}"

if __name__ == "__main__":
    mcp.run()

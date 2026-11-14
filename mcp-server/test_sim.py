import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add parent path to import server
sys.path.append(os.path.dirname(__file__))

from server import get_gtm_products, create_gtm_product, implement_gtm_strategy

def test_mcp_flow():
    print("==================================================")
    print("🚀 LaunchPulse Claude MCP Simulation Test")
    print("==================================================")

    # 1. Inspect existing products
    print("\n[Step 1] Claude inspects active products via get_gtm_products():")
    prods_output = get_gtm_products()
    print(prods_output)

    # 2. Claude creates a new product via create_gtm_product()
    print("\n[Step 2] Claude Desktop onboards 'Zenith Flow Keypad' into LaunchPulse:")
    create_output = create_gtm_product(
        name="Zenith Flow Keypad",
        industry="Ergonomic Hardware & Workspace Tech",
        retail_price=189.0,
        unit_cost=55.0,
        concept_hook="Low-profile magnetic ortholinear mechanical macro pad for developers.",
        is_existing_product=False,
        currency="USD"
    )
    print(create_output)

    # 3. Claude implements a GTM campaign via implement_gtm_strategy()
    print("\n[Step 3] Claude executes GTM campaign on product 1:")
    strat_output = implement_gtm_strategy(product_id=1, campaign_id=1)
    print(strat_output)

    print("\n==================================================")
    print("✅ MCP SIMULATION TEST COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_mcp_flow()

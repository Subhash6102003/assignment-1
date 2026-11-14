from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ================= CAMPAIGN SCHEMAS =================
class CampaignBase(BaseModel):
    title: str
    channel_type: str
    budget: float = 0.0
    target_cpa: float = 0.0
    projected_lift_pct: float = 15.0
    status: str = "draft"
    tactic: str
    timeline: str

class CampaignCreate(CampaignBase):
    product_id: int

class CampaignOut(CampaignBase):
    id: int
    product_id: int
    created_at: str

# ================= PRODUCT PLAN SCHEMAS =================
class ProductPlanBase(BaseModel):
    tier_name: str
    price: float
    billing_frequency: str = "one-time"
    is_hero_tier: bool = False
    features: List[str] = []
    target_buyer: str
    roadmap_phase: str = "Phase 1: Launch"
    status: str = "active"

class ProductPlanCreate(ProductPlanBase):
    product_id: int

class ProductPlanOut(ProductPlanBase):
    id: int
    product_id: int

# ================= REPORT SCHEMAS =================
class ReportSectionBase(BaseModel):
    section_order: int
    title: str
    content: str

class ReportSectionOut(ReportSectionBase):
    id: int
    report_id: int

class GTMReportCreate(BaseModel):
    product_id: int
    title: str
    sections: List[ReportSectionBase]

class GTMReportOut(BaseModel):
    id: int
    product_id: int
    title: str
    status: str
    view_count: int
    last_viewed_at: Optional[str] = None
    is_implemented: bool
    created_at: str
    sections: List[ReportSectionOut] = []

# ================= PRODUCT SCHEMAS =================
class ProductCreate(BaseModel):
    name: str
    industry: str
    stage: str = "pre-launch"
    is_existing_product: bool = False
    currency: str = "USD"
    hook: str
    retail_price: float = 389.0
    unit_cost: float = 140.0
    historical_sales: Optional[List[float]] = None

class ProductOut(BaseModel):
    id: int
    name: str
    industry: str
    stage: str
    is_existing_product: bool
    currency: str
    hook: str
    retail_price: float
    unit_cost: float
    projected_margin: float
    active_sales: float
    product_revenue: float
    units_sold: int
    conversion_rate: float
    health_score: int
    monthly_curve: List[float] = []
    created_at: str
    campaigns: List[CampaignOut] = []
    plans: List[ProductPlanOut] = []
    reports: List[GTMReportOut] = []

import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  fetchProducts, 
  createProductAPI, 
  implementCampaignAPI, 
  implementReportAPI, 
  updateProductPriceAPI,
  updateReportSectionAPI,
  getReportPdfUrl
} from './api';
import type { Product } from './types';
import { 
  LayoutDashboard, 
  Box, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Megaphone, 
  Layers, 
  FileText, 
  Settings as SettingsIcon, 
  Plus, 
  Bell, 
  Share2, 
  Check, 
  Edit3, 
  Save, 
  Zap, 
  Download,
  ChevronDown
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = useState<number>(1);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<'USD' | 'INR' | 'EUR' | 'GBP'>('USD');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5); // Jun = 5
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for Uploading Product
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [isExistingProductMode, setIsExistingProductMode] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductIndustry, setNewProductIndustry] = useState<string>('Hardware & Electronics');
  const [newProductPrice, setNewProductPrice] = useState<number>(299);
  const [newProductCost, setNewProductCost] = useState<number>(110);
  const [newProductHook, setNewProductHook] = useState<string>('');
  const [historicalSalesInput, setHistoricalSalesInput] = useState<string>('12000, 14500, 18000, 16200, 21000, 24000, 22500, 26000, 29000, 27500, 31000, 35000');

  // Simulator State for Product Plan & Pricing
  const [simPrice, setSimPrice] = useState<number>(389);

  // Editing state for Claude Report Sections
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionContent, setEditingSectionContent] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (silent: boolean = false) => {
    const prods = await fetchProducts();
    if (prods && prods.length > 0) {
      setProducts(prods);
      if (!silent) {
        if (!prods.find(p => p.id === activeProductId)) {
          setActiveProductId(prods[0].id);
          setSimPrice(prods[0].retail_price);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    // Live synchronization with Claude Desktop MCP node (every 3.5s)
    const interval = setInterval(() => {
      loadData(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeProductId]);

  const activeProduct: Product | undefined = products.find(p => p.id === activeProductId) || products[0];

  useEffect(() => {
    if (activeProduct) {
      setSimPrice(activeProduct.retail_price);
    }
  }, [activeProductId, activeProduct]);

  // Currency Conversions
  const currencyRates = {
    USD: { symbol: '$', rate: 1.0 },
    INR: { symbol: '₹', rate: 84.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.78 }
  };

  const formatMoney = (usdAmount: number): string => {
    const config = currencyRates[currency];
    const converted = usdAmount * config.rate;
    if (currency === 'INR') {
      return `${config.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
  };

  // Month names for 12-month analytics curve
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Okt', 'Nov', 'Dec'];
  const currentCurve = activeProduct ? activeProduct.monthly_curve : [42, 48, 78, 65, 50, 70, 38, 52, 47, 55, 60, 72];

  // Implementation handlers
  const handleImplementCampaign = async (campaignId: number) => {
    if (!activeProduct) return;
    const res = await implementCampaignAPI(activeProduct.id, campaignId);
    if (res) {
      showToast('🚀 Campaign implemented! Sales curve lifted by +15% and metrics updated.');
      loadData();
    } else {
      // Local optimistic update
      const updatedProds = products.map(p => {
        if (p.id === activeProduct.id) {
          const liftedCurve = p.monthly_curve.map(v => Math.min(100, Math.round(v * 1.15)));
          const updatedCampaigns = p.campaigns.map(c => c.id === campaignId ? { ...c, status: 'implemented' } : c);
          return {
            ...p,
            monthly_curve: liftedCurve,
            active_sales: Math.round(p.active_sales * 1.15),
            product_revenue: Math.round(p.product_revenue * 1.15),
            campaigns: updatedCampaigns
          };
        }
        return p;
      });
      setProducts(updatedProds);
      showToast('🚀 Campaign implemented! Sales curve lifted by +15% across remaining quarters.');
    }
  };

  const handleImplementReport = async (reportId: number) => {
    if (!activeProduct) return;
    await implementReportAPI(activeProduct.id, reportId);
    const updatedProds = products.map(p => {
      if (p.id === activeProduct.id) {
        return {
          ...p,
          health_score: 94,
          reports: p.reports.map(r => r.id === reportId ? { ...r, is_implemented: true } : r)
        };
      }
      return p;
    });
    setProducts(updatedProds);
    showToast('✨ Claude GTM recommendations implemented! Health Score updated to 94/100.');
  };

  const handleUpdatePrice = async () => {
    if (!activeProduct) return;
    const res = await updateProductPriceAPI(activeProduct.id, simPrice);
    if (res) {
      const updatedProds = products.map(p => {
        if (p.id === activeProduct.id) {
          return { ...p, retail_price: res.retail_price, projected_margin: res.projected_margin };
        }
        return p;
      });
      setProducts(updatedProds);
      showToast(`✅ Price updated to $${simPrice}. Margin recalculated to ${res.projected_margin}%.`);
    } else {
      const margin = roundMargin(simPrice, activeProduct.unit_cost);
      setProducts(products.map(p => p.id === activeProduct.id ? { ...p, retail_price: simPrice, projected_margin: margin } : p));
      showToast(`✅ Price updated to $${simPrice}. Margin recalculated to ${margin}%.`);
    }
  };

  const handleSaveSection = async (reportId: number, sectionId: number) => {
    await updateReportSectionAPI(reportId, sectionId, editingSectionContent);
    const updatedProds = products.map(p => {
      if (p.id === activeProduct?.id) {
        return {
          ...p,
          reports: p.reports.map(r => {
            if (r.id === reportId) {
              return {
                ...r,
                sections: r.sections.map(s => s.id === sectionId ? { ...s, content: editingSectionContent } : s)
              };
            }
            return r;
          })
        };
      }
      return p;
    });
    setProducts(updatedProds);
    setEditingSectionId(null);
    showToast('📝 Strategic section saved and persisted.');
  };

  const roundMargin = (price: number, cost: number) => {
    if (price <= 0) return 0;
    return Math.round(((price - cost) / price) * 1000) / 10;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let historicalSales: number[] | undefined = undefined;
    if (isExistingProductMode && historicalSalesInput) {
      historicalSales = historicalSalesInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    }

    const payload = {
      name: newProductName || 'New GTM Innovation',
      industry: newProductIndustry,
      stage: isExistingProductMode ? 'growth' : 'pre-launch',
      is_existing_product: isExistingProductMode,
      currency: 'USD',
      hook: newProductHook || 'Engineered for high-performing modern teams.',
      retail_price: Number(newProductPrice) || 299,
      unit_cost: Number(newProductCost) || 100,
      historical_sales: historicalSales
    };

    const created = await createProductAPI(payload);
    if (created) {
      setProducts([...products, created]);
      setActiveProductId(created.id);
      showToast(`🎉 Product "${created.name}" created and onboarded into GTM Studio!`);
    } else {
      // Optimistic local fallback
      const margin = roundMargin(payload.retail_price, payload.unit_cost);
      const newProd: Product = {
        id: Date.now(),
        name: payload.name,
        industry: payload.industry,
        stage: payload.stage,
        is_existing_product: payload.is_existing_product,
        currency: 'USD',
        hook: payload.hook,
        retail_price: payload.retail_price,
        unit_cost: payload.unit_cost,
        projected_margin: margin,
        active_sales: isExistingProductMode ? 45000 : 24064,
        product_revenue: isExistingProductMode ? 32000 : 15490,
        units_sold: 1420,
        conversion_rate: 11.2,
        health_score: 85,
        monthly_curve: historicalSales && historicalSales.length >= 12 ? historicalSales.slice(0, 12).map(v => Math.min(100, Math.round(v / 500))) : [45, 50, 68, 60, 55, 75, 40, 58, 52, 60, 65, 80],
        created_at: new Date().toISOString(),
        campaigns: [
          { id: 101, product_id: Date.now(), title: 'Targeted Growth Engine', channel_type: 'Paid', budget: 2000, target_cpa: 50, projected_lift_pct: 20, status: 'active', tactic: 'High-intent search and retargeting ads.', timeline: 'Month 1' }
        ],
        plans: [
          { id: 201, product_id: Date.now(), tier_name: 'Core Plan', price: payload.retail_price, billing_frequency: 'one-time', is_hero_tier: true, features: ['Standard Edition', 'Full Warranty', 'Support'], target_buyer: 'General Audience', roadmap_phase: 'Phase 1', status: 'active' }
        ],
        reports: [
          {
            id: 301,
            product_id: Date.now(),
            title: `${payload.name} — GTM Strategic Dossier`,
            status: 'published',
            view_count: 1,
            is_implemented: false,
            created_at: new Date().toISOString(),
            sections: [
              { id: 401, report_id: 301, section_order: 1, title: '1. Executive Summary', content: `LaunchPulse initialized GTM diagnosis for ${payload.name}. Product is ready for full-scale Claude GTM strategy.` }
            ]
          }
        ]
      };
      setProducts([...products, newProd]);
      setActiveProductId(newProd.id);
      showToast(`🎉 Product "${newProd.name}" initialized in studio!`);
    }

    setShowUploadModal(false);
    setNewProductName('');
    setNewProductHook('');
  };

  // Safe active product values
  const prodActiveSales = activeProduct?.active_sales || 24064;
  const prodRevenue = activeProduct?.product_revenue || 15490;
  const prodSold = activeProduct?.units_sold || 2355;
  const prodConv = activeProduct?.conversion_rate || 12.5;
  const prodHealth = activeProduct?.health_score || 82;
  const prodCampaigns = activeProduct?.campaigns || [];
  const prodPlans = activeProduct?.plans || [];
  const prodReports = activeProduct?.reports || [];

  const dynamicSimMargin = roundMargin(simPrice, activeProduct ? activeProduct.unit_cost : 140);
  const breakEvenUnits = simPrice > (activeProduct?.unit_cost || 140) ? Math.ceil(35000 / (simPrice - (activeProduct?.unit_cost || 140))) : 0;
  const cacPaybackDays = Math.max(12, Math.round((65 / Math.max(1, (simPrice - (activeProduct?.unit_cost || 140)))) * 30));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#111827',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #374151'
        }}>
          {toastMessage}
        </div>
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="brand-box">
          <div className="brand-left" onClick={() => setActiveView('dashboard')}>
            <div className="brand-avatar">LP</div>
            <div>
              <div className="brand-title">LaunchPulse</div>
              <div className="brand-plan">GTM Studio</div>
            </div>
          </div>
          <button className="btn-collapse" title="Collapse Menu" onClick={() => showToast('Sidebar locked in full studio mode')}>
            «
          </button>
        </div>

        {/* Upload Product CTA */}
        <button className="btn-upload-product" onClick={() => setShowUploadModal(true)}>
          <Plus size={15} />
          Upload Product
        </button>

        {/* Main Menu */}
        <div className="sidebar-section">
          <div className="sidebar-heading">Main Menu</div>
          <ul className="nav-list">
            <li>
              <div 
                className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                <div className="nav-left-slot">
                  <LayoutDashboard className="nav-icon" />
                  <span>Dashboard</span>
                </div>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'product' ? 'active' : ''}`}
                onClick={() => setActiveView('product')}
              >
                <div className="nav-left-slot">
                  <Box className="nav-icon" />
                  <span>Product</span>
                </div>
                <span className="nav-badge">{products.length}</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'sales' ? 'active' : ''}`}
                onClick={() => setActiveView('sales')}
              >
                <div className="nav-left-slot">
                  <DollarSign className="nav-icon" />
                  <span>Sales</span>
                </div>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'order' ? 'active' : ''}`}
                onClick={() => setActiveView('order')}
              >
                <div className="nav-left-slot">
                  <ShoppingCart className="nav-icon" />
                  <span>Order</span>
                </div>
                <span className="nav-badge">{prodSold.toLocaleString()}</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'customer' ? 'active' : ''}`}
                onClick={() => setActiveView('customer')}
              >
                <div className="nav-left-slot">
                  <Users className="nav-icon" />
                  <span>Customer</span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Workspace: 3 Core GTM Engineer Tabs */}
        <div className="sidebar-section">
          <div className="sidebar-heading">Workspace</div>
          <ul className="nav-list">
            <li>
              <div 
                className={`nav-item ${activeView === 'campaigns' ? 'active' : ''}`}
                onClick={() => setActiveView('campaigns')}
              >
                <div className="nav-left-slot">
                  <div className="color-dot dot-blue"></div>
                  <span>Campaign</span>
                </div>
                <span className="nav-badge">{prodCampaigns.length}</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveView('plans')}
              >
                <div className="nav-left-slot">
                  <div className="color-dot dot-pink"></div>
                  <span>Product Plan</span>
                </div>
                <span className="nav-badge">{prodPlans.length}</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveView('reports')}
              >
                <div className="nav-left-slot">
                  <div className="color-dot dot-orange"></div>
                  <span>Report</span>
                </div>
                <span className="nav-badge">{prodReports.length}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer: MCP Server Connected & Settings */}
        <div className="sidebar-footer">
          <div className="mcp-status-pill" onClick={() => setActiveView('mcp')} title="Inspect Claude Desktop MCP Connection">
            <div className="mcp-pill-left">
              <span className="pulse-dot"></span>
              <span>MCP Server Connected</span>
            </div>
            <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800 }}>:8000</span>
          </div>

          <ul className="nav-list">
            <li>
              <div 
                className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveView('settings')}
              >
                <div className="nav-left-slot">
                  <SettingsIcon className="nav-icon" />
                  <span>Settings</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <main className="main-wrapper">
        {/* Top Header: Clean, No Search, Only Product Pill, Currency Switcher, Bell, Share */}
        <header className="top-header">
          <div className="header-left-title">
            <h1 className="page-title">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'product' && 'Product Portfolio'}
              {activeView === 'sales' && 'Sales Performance Engine'}
              {activeView === 'order' && 'Order Pipeline Diagnostics'}
              {activeView === 'customer' && 'Customer Personas & ICP'}
              {activeView === 'campaigns' && 'GTM Campaign Studio'}
              {activeView === 'plans' && 'Product Plan & Pricing Architecture'}
              {activeView === 'reports' && 'Claude GTM Strategic Reports'}
              {activeView === 'mcp' && 'Model Context Protocol (MCP) Node'}
              {activeView === 'settings' && 'Studio Settings'}
            </h1>

            {/* Active Product Selector Badge */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select 
                value={activeProductId} 
                onChange={(e) => setActiveProductId(Number(e.target.value))}
                style={{
                  background: '#ffe4d4',
                  color: '#ff5c00',
                  border: 'none',
                  padding: '6px 28px 6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none'
                }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.is_existing_product ? '(Historical)' : '(New)'}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '8px', color: '#ff5c00', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Top Actions: Multi-Currency Switcher + Notification Bell + Share */}
          <div className="top-actions">
            {/* Multi Currency Switcher */}
            <div className="currency-pill-box">
              {(['USD', 'INR', 'EUR', 'GBP'] as const).map(c => (
                <button 
                  key={c}
                  className={`currency-btn ${currency === c ? 'active' : ''}`}
                  onClick={() => {
                    setCurrency(c);
                    showToast(`Currency switched to ${c} (${currencyRates[c].symbol})`);
                  }}
                >
                  {c === 'USD' && '$ USD'}
                  {c === 'INR' && '₹ INR'}
                  {c === 'EUR' && '€ EUR'}
                  {c === 'GBP' && '£ GBP'}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <button className="icon-btn" onClick={() => showToast('🔔 Claude MCP has generated 1 new GTM campaign recommendation.')}>
              <Bell size={16} />
            </button>

            {/* Share Blueprint Button */}
            <button className="btn-white" onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('🔗 Public Studio View Link copied to clipboard!');
            }}>
              <Share2 size={14} />
              Share
            </button>
          </div>
        </header>

        {/* Sub Navigation Bar: Quick Filter Tabs */}
        <div className="sub-bar">
          <div className="tab-pills">
            <button 
              className={`tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeView === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveView('sales')}
            >
              Sales
            </button>
            <button 
              className={`tab-btn ${activeView === 'order' ? 'active' : ''}`}
              onClick={() => setActiveView('order')}
            >
              Order
            </button>
            <button 
              className={`tab-btn ${activeView === 'campaigns' ? 'active' : ''}`}
              onClick={() => setActiveView('campaigns')}
            >
              Campaigns
            </button>
            <button 
              className={`tab-btn ${activeView === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveView('plans')}
            >
              Product Plan
            </button>
            <button 
              className={`tab-btn ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              Reports
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-white" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => showToast('Filter applied: All Channels')}>
              Filters
            </button>
            <button 
              className="btn-dark" 
              style={{ fontSize: '11px', padding: '6px 14px' }} 
              onClick={() => {
                if (prodReports.length > 0) {
                  window.open(getReportPdfUrl(prodReports[0].id), '_blank');
                  showToast('📄 Exporting Executive GTM Dossier PDF...');
                } else {
                  showToast('No reports available for this product.');
                }
              }}
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* ================= VIEW 1: DASHBOARD (MATCHING THE SCREENSHOT EXACTLY) ================= */}
        {activeView === 'dashboard' && (
          <div className="page-view active-view">
            {/* Top 4 KPI Cards */}
            <div className="metrics-grid">
              {/* Card 1: Active Sales */}
              <div className="metric-card">
                <div>
                  <div className="metric-top">
                    <span className="metric-label">Active Sales</span>
                  </div>
                  <div className="metric-mid">
                    <span className="metric-value">{formatMoney(prodActiveSales)}</span>
                    <div className="metric-sparkline">
                      <div className="spark-bar" style={{ height: '40%' }}></div>
                      <div className="spark-bar" style={{ height: '70%' }}></div>
                      <div className="spark-bar active" style={{ height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="metric-badge">↑ 12%</span>
                    <span className="metric-subtext">vs last month</span>
                  </div>
                </div>
                <div className="metric-footer">
                  <span className="see-details-link" onClick={() => setActiveView('sales')}>
                    See Details →
                  </span>
                </div>
              </div>

              {/* Card 2: Product Revenue */}
              <div className="metric-card">
                <div>
                  <div className="metric-top">
                    <span className="metric-label">Product Revenue</span>
                  </div>
                  <div className="metric-mid">
                    <span className="metric-value">{formatMoney(prodRevenue)}</span>
                    <svg width="45" height="24" viewBox="0 0 50 25" fill="none">
                      <path d="M2 20 L15 15 L28 18 L48 4" stroke="#ff5c00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="metric-badge">↑ 9%</span>
                    <span className="metric-subtext">vs last month</span>
                  </div>
                </div>
                <div className="metric-footer">
                  <span className="see-details-link" onClick={() => setActiveView('sales')}>
                    See Details →
                  </span>
                </div>
              </div>

              {/* Card 3: Product Sold */}
              <div className="metric-card">
                <div>
                  <div className="metric-top">
                    <span className="metric-label">Product Sold</span>
                  </div>
                  <div className="metric-mid">
                    <span className="metric-value">{prodSold.toLocaleString()}</span>
                    <svg width="28" height="28" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe4d4" strokeWidth="4"/>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 12 6" fill="none" stroke="#ff5c00" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="metric-badge">↑ 7%</span>
                    <span className="metric-subtext">vs last month</span>
                  </div>
                </div>
                <div className="metric-footer">
                  <span className="see-details-link" onClick={() => setActiveView('order')}>
                    See Details →
                  </span>
                </div>
              </div>

              {/* Card 4: Conversion Rate */}
              <div className="metric-card">
                <div>
                  <div className="metric-top">
                    <span className="metric-label">Conversion Rate</span>
                  </div>
                  <div className="metric-mid">
                    <span className="metric-value">{prodConv}%</span>
                    <div className="metric-sparkline" style={{ gap: '2px' }}>
                      <div className="spark-bar" style={{ height: '30%' }}></div>
                      <div className="spark-bar active" style={{ height: '80%' }}></div>
                      <div className="spark-bar" style={{ height: '50%' }}></div>
                      <div className="spark-bar" style={{ height: '95%' }}></div>
                      <div className="spark-bar" style={{ height: '40%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="metric-badge">↑ 2%</span>
                    <span className="metric-subtext">vs last month</span>
                  </div>
                </div>
                <div className="metric-footer">
                  <span className="see-details-link" onClick={() => setActiveView('customer')}>
                    See Details →
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Sales Performance Gauge + 12-Month Hatched Bar Analytics Chart */}
            <div className="middle-grid">
              {/* Sales Performance Gauge */}
              <div className="content-card">
                <div className="card-header-row">
                  <div className="card-title">Sales Performance</div>
                </div>

                <div className="gauge-container">
                  <svg className="gauge-svg" viewBox="0 0 200 110">
                    {/* Background Arc */}
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ffe4d4" strokeWidth="16" strokeLinecap="round" />
                    {/* Active Score Arc */}
                    <path 
                      d="M 20 100 A 80 80 0 0 1 180 100" 
                      fill="none" 
                      stroke="#ff5c00" 
                      strokeWidth="16" 
                      strokeLinecap="round" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 * (1 - (prodHealth / 100))}
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="gauge-center-text">
                    <div className="gauge-num">
                      {prodHealth} <span className="gauge-plus">+{prodHealth >= 90 ? '12' : '1'}</span>
                    </div>
                    <div className="gauge-sub">of 100 points</div>
                  </div>
                </div>

                <div className="team-callout">
                  <div className="team-callout-title">Your team is great! ✨</div>
                  <div className="team-callout-desc">
                    {prodHealth >= 90 
                      ? 'Claude GTM recommendations are fully active. Campaign lift is pacing 15% above target.' 
                      : 'The team is performing well above average, meeting or exceeding targets in several areas.'}
                  </div>
                </div>

                <div className="improve-score-link" onClick={() => setActiveView('reports')}>
                  Improve Your Score →
                </div>
              </div>

              {/* 12-Month Hatched Bar Analytics Chart */}
              <div className="content-card">
                <div className="card-header-row">
                  <div className="card-title">Analytics</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn-white" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => showToast('Viewing 2026 GTM Forecast Range')}>
                      Last Year ▾
                    </button>
                  </div>
                </div>

                <div className="chart-box">
                  {/* Y-Axis */}
                  <div className="chart-y-axis">
                    <span>$4K</span>
                    <span>$3K</span>
                    <span>$2K</span>
                    <span>$1K</span>
                    <span>0</span>
                  </div>

                  {/* Columns */}
                  <div className="chart-columns">
                    {months.map((m, idx) => {
                      const val = currentCurve[idx] || 50;
                      const isSelected = selectedMonthIndex === idx;
                      const isHovered = hoveredMonthIndex === idx;

                      return (
                        <div 
                          key={m} 
                          className={`month-col ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedMonthIndex(idx)}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          onMouseLeave={() => setHoveredMonthIndex(null)}
                        >
                          <div 
                            className="hatched-bar" 
                            style={{ 
                              height: `${val}%`,
                              ...(isSelected ? { background: '#ff5c00', borderColor: '#ff5c00' } : {})
                            }}
                          ></div>
                          <span className="month-label">{m}</span>

                          {/* Interactive Tooltip on active or hovered column */}
                          {(isSelected || isHovered) && (
                            <div className="chart-tooltip" style={{ bottom: `${val + 15}%` }}>
                              <div className="tooltip-date">{m}. 2026</div>
                              <div className="tooltip-row">
                                <span style={{ color: '#94a3b8' }}>Revenue</span>
                                <span className="tooltip-val">{formatMoney(Math.round((val / 100) * 3950))}</span>
                              </div>
                              <div className="tooltip-row">
                                <span style={{ color: '#94a3b8' }}>Conv. Rate</span>
                                <span className="tooltip-val">{Math.round((val / 8.5) * 10) / 10}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Visit by Time Heatmap + Total Visit Donut Chart */}
            <div className="bottom-grid">
              {/* Visit by Time Heatmap */}
              <div className="content-card">
                <div className="heatmap-header">
                  <div className="card-title">Visit by Time</div>
                  <div className="heatmap-legend">
                    <span>0</span>
                    <div className="legend-boxes">
                      <div className="l-box lb-1"></div>
                      <div className="l-box lb-2"></div>
                      <div className="l-box lb-3"></div>
                    </div>
                    <span>10,000+</span>
                  </div>
                </div>

                <table className="heatmap-table">
                  <thead>
                    <tr>
                      <th style={{ width: '85px' }}></th>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <th key={day} className="heatmap-th">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="time-slot-label">12 AM - 8 AM</td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-0"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-0"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                    </tr>
                    <tr>
                      <td className="time-slot-label">8 AM - 4 PM</td>
                      <td><div className="heat-pill heat-lvl-3"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-3"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-3"></div></td>
                    </tr>
                    <tr>
                      <td className="time-slot-label">4 PM - 12 AM</td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                      <td><div className="heat-pill heat-lvl-3"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-2"></div></td>
                      <td><div className="heat-pill heat-lvl-1"></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Visit Donut Chart */}
              <div className="content-card">
                <div className="card-title">Total Visit</div>
                
                <div className="donut-layout">
                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>191,886</div>
                    <div style={{ fontSize: '11px', color: '#12b76a', fontWeight: 700, marginTop: '2px' }}>
                      ↑ 8.5% <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs last month</span>
                    </div>
                  </div>

                  <div className="donut-svg-box">
                    <svg width="110" height="110" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ffe4d4" strokeWidth="8"/>
                      <circle 
                        cx="21" 
                        cy="21" 
                        r="15.91549430918954" 
                        fill="transparent" 
                        stroke="#ff5c00" 
                        strokeWidth="8"
                        strokeDasharray="60 40" 
                        strokeDashoffset="25"
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '24px', right: '4px', fontSize: '10px', fontWeight: 800, color: '#ff5c00' }}>
                      60%
                    </div>
                    <div style={{ position: 'absolute', bottom: '24px', left: '4px', fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>
                      40%
                    </div>
                  </div>
                </div>

                <div className="donut-stats-list">
                  <div className="donut-row">
                    <div className="donut-label-box">
                      <span className="donut-dot dot-orange-solid"></span>
                      <span>Mobile</span>
                    </div>
                    <span className="donut-num">115,132</span>
                  </div>
                  <div className="donut-row">
                    <div className="donut-label-box">
                      <span className="donut-dot dot-orange-peach"></span>
                      <span>Website</span>
                    </div>
                    <span className="donut-num">76,754</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: CAMPAIGN STUDIO (WORKSPACE TAB 1) ================= */}
        {activeView === 'campaigns' && (
          <div className="page-view active-view">
            <div className="gtm-context-card">
              <div className="gtm-context-left">
                <div className="gtm-context-title">
                  <Megaphone size={16} color="#ff5c00" />
                  Autonomous GTM Campaigns & Channels
                </div>
                <div className="gtm-context-desc">
                  Claude synthesizes launch channels, creator seeding, and targeted acquisition campaigns via MCP. 
                  Clicking <strong>"Implement Campaign"</strong> applies the tactical playbook, lifting the 12-month sales curve by +15% and recalculating unit sales in real-time.
                </div>
              </div>
              <button className="btn-dark" onClick={() => showToast('💡 Prompt Claude: "Generate a new TikTok UGC campaign for ApexDesk Pro"')}>
                Ask Claude to Propose Campaign
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {prodCampaigns.map(camp => (
                <div key={camp.id} className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: camp.channel_type === 'Creator' ? '#eff6ff' : camp.channel_type === 'Paid' ? '#fdf2f8' : '#f0fdf4',
                        color: camp.channel_type === 'Creator' ? '#1d4ed8' : camp.channel_type === 'Paid' ? '#be185d' : '#15803d'
                      }}>
                        {camp.channel_type} Channel
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: camp.status === 'implemented' ? '#12b76a' : '#ff5c00',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {camp.status === 'implemented' && <Check size={12} />}
                        {camp.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: '#111827' }}>
                      {camp.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginBottom: '16px' }}>
                      {camp.tactic}
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      background: '#f8f9fb',
                      padding: '12px',
                      borderRadius: '10px',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>BUDGET</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{formatMoney(camp.budget)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>TARGET CPA</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{formatMoney(camp.target_cpa)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>PROJECTED LIFT</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#12b76a' }}>+{camp.projected_lift_pct}%</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f3f7', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      Timeline: <strong>{camp.timeline}</strong>
                    </span>
                    {camp.status === 'implemented' ? (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#12b76a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Implemented in Sales Curve
                      </span>
                    ) : (
                      <button 
                        className="btn-gtm-action" 
                        onClick={() => handleImplementCampaign(camp.id)}
                      >
                        <Zap size={14} /> Implement Campaign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: PRODUCT PLAN & PRICING (WORKSPACE TAB 2) ================= */}
        {activeView === 'plans' && (
          <div className="page-view active-view">
            <div className="gtm-context-card">
              <div className="gtm-context-left">
                <div className="gtm-context-title">
                  <Layers size={16} color="#ff5c00" />
                  Product Packaging Architecture & Margin Elasticity
                </div>
                <div className="gtm-context-desc">
                  Simulate retail price points, unit manufacturing margins, and break-even thresholds. Click <strong>"Implement Tier Pricing"</strong> to update the official catalog price in the backend and shift unit margins.
                </div>
              </div>
            </div>

            {/* Interactive Pricing Slider & Unit Economics Box */}
            <div className="content-card" style={{ marginBottom: '20px' }}>
              <div className="card-header-row">
                <div className="card-title">Dynamic Pricing & Unit Economics Simulator</div>
                <button className="btn-gtm-action" onClick={handleUpdatePrice}>
                  <Check size={14} /> Implement Tier Pricing
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#f8f9fb', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>RETAIL TARGET PRICE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff5c00', marginTop: '4px' }}>{formatMoney(simPrice)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Competitor avg: $429</div>
                </div>

                <div style={{ background: '#f8f9fb', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>UNIT COST</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{formatMoney(activeProduct ? activeProduct.unit_cost : 140)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Solid bamboo + dual motor</div>
                </div>

                <div style={{ background: '#f8f9fb', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>GROSS MARGIN</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: dynamicSimMargin >= 60 ? '#12b76a' : '#f59e0b', marginTop: '4px' }}>{dynamicSimMargin}%</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Target: &gt; 60%</div>
                </div>

                <div style={{ background: '#f8f9fb', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>BREAK-EVEN UNITS</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{breakEvenUnits} units</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>CAC Payback: {cacPaybackDays} days</div>
                </div>
              </div>

              {/* Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Adjust Retail Price:</span>
                <input 
                  type="range" 
                  min="199" 
                  max="699" 
                  step="10"
                  value={simPrice} 
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ff5c00', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827', minWidth: '70px', textAlign: 'right' }}>
                  {formatMoney(simPrice)}
                </span>
              </div>
            </div>

            {/* 3-Tier Packaging Architecture Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {prodPlans.map(plan => (
                <div 
                  key={plan.id} 
                  className="content-card"
                  style={{
                    border: plan.is_hero_tier ? '2px solid #ff5c00' : '1px solid #eceef2',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {plan.is_hero_tier && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '20px',
                      background: '#ff5c00',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.5px'
                    }}>
                      HERO TIER
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{plan.roadmap_phase}</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>{plan.tier_name}</h3>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: plan.is_hero_tier ? '#ff5c00' : '#111827', margin: '12px 0' }}>
                      {formatMoney(plan.price)}
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}> /{plan.billing_frequency}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                      Target: <strong>{plan.target_buyer}</strong>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {plan.features.map((feat, idx) => (
                        <li key={idx} style={{ fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={14} color="#12b76a" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className={plan.is_hero_tier ? 'btn-gtm-action' : 'btn-white'} 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setSimPrice(plan.price);
                      showToast(`Selected ${plan.tier_name} price point ($${plan.price}) in simulator.`);
                    }}
                  >
                    Select {plan.tier_name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= VIEW 4: CLAUDE GTM REPORTS (WORKSPACE TAB 3) ================= */}
        {activeView === 'reports' && (
          <div className="page-view active-view">
            <div className="gtm-context-card">
              <div className="gtm-context-left">
                <div className="gtm-context-title">
                  <FileText size={16} color="#ff5c00" />
                  Claude Model Context Protocol (MCP) Strategic Dossier
                </div>
                <div className="gtm-context-desc">
                  Strategic insights extracted and synthesized autonomously by Claude via MCP tools. 
                  Edit any section in-place to refine recommendations, then click <strong>"Implement Report Recommendations"</strong> to boost the GTM Health Score to 94/100.
                </div>
              </div>
              {prodReports[0]?.is_implemented ? (
                <div style={{ background: '#ecfdf3', color: '#12b76a', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> Recommendations Active (94/100)
                </div>
              ) : (
                <button className="btn-gtm-action" onClick={() => prodReports[0] && handleImplementReport(prodReports[0].id)}>
                  <Zap size={14} /> Implement Report Recommendations
                </button>
              )}
            </div>

            {prodReports.map(rep => (
              <div key={rep.id} className="content-card" style={{ marginBottom: '20px' }}>
                <div className="card-header-row">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{rep.title}</h2>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Status: <strong style={{ color: '#12b76a' }}>{rep.status.toUpperCase()}</strong> • Generated via FastMCP stdio • View Count: {rep.view_count}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a 
                      href={getReportPdfUrl(rep.id)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-white" 
                      style={{ textDecoration: 'none' }}
                      onClick={() => showToast('📥 Downloading Executive GTM Strategic PDF Dossier...')}
                    >
                      <Download size={14} color="#ff5c00" />
                      <span>Download PDF Dossier</span>
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
                  {rep.sections.map(sec => {
                    const isEditing = editingSectionId === sec.id;
                    return (
                      <div key={sec.id} style={{ background: '#f8f9fb', border: '1px solid #eceef2', borderRadius: '12px', padding: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{sec.title}</h4>
                          {isEditing ? (
                            <button 
                              className="btn-dark" 
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={() => handleSaveSection(rep.id, sec.id)}
                            >
                              <Save size={12} /> Save
                            </button>
                          ) : (
                            <button 
                              className="btn-white" 
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => {
                                setEditingSectionId(sec.id);
                                setEditingSectionContent(sec.content);
                              }}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea 
                            value={editingSectionContent}
                            onChange={(e) => setEditingSectionContent(e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '90px',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontFamily: 'inherit',
                              fontSize: '13px',
                              lineHeight: '1.5'
                            }}
                          />
                        ) : (
                          <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                            {sec.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= VIEW 5: PRODUCT PORTFOLIO ================= */}
        {activeView === 'product' && (
          <div className="page-view active-view">
            <div className="card-header-row">
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Product Portfolio ({products.length})</h2>
              <button className="btn-gtm-action" onClick={() => setShowUploadModal(true)}>
                <Plus size={14} /> Add Another Product
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Industry / Category</th>
                  <th>Stage</th>
                  <th>Target Price</th>
                  <th>Unit Cost</th>
                  <th>Gross Margin</th>
                  <th>GTM Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ background: p.id === activeProductId ? '#fff9f5' : 'transparent' }}>
                    <td style={{ fontWeight: 800 }}>
                      {p.name} {p.id === activeProductId && <span style={{ color: '#ff5c00', fontSize: '11px' }}>● Active</span>}
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>{p.hook.substring(0, 50)}...</div>
                    </td>
                    <td>{p.industry}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#f1f3f7' }}>
                        {p.stage}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatMoney(p.retail_price)}</td>
                    <td>{formatMoney(p.unit_cost)}</td>
                    <td style={{ fontWeight: 800, color: p.projected_margin >= 60 ? '#12b76a' : '#f59e0b' }}>
                      {p.projected_margin}%
                    </td>
                    <td style={{ fontWeight: 800 }}>{p.health_score}/100</td>
                    <td>
                      <button 
                        className="btn-white" 
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => {
                          setActiveProductId(p.id);
                          showToast(`Activated ${p.name} as current studio product.`);
                        }}
                      >
                        Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= VIEW 6: SALES ENGINE ================= */}
        {activeView === 'sales' && (
          <div className="page-view active-view">
            <div className="content-card" style={{ marginBottom: '20px' }}>
              <div className="card-header-row">
                <div className="card-title">Channel Breakdown & Velocity</div>
                <button className="btn-white" onClick={() => showToast('Sales data synchronized with backend')}>
                  Refresh Metrics
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#f8f9fb', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>DIRECT CONSUMER (DTC)</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{formatMoney(prodActiveSales * 0.65)}</div>
                  <div style={{ fontSize: '11px', color: '#12b76a', fontWeight: 700, marginTop: '2px' }}>65% of Total Volume</div>
                </div>

                <div style={{ background: '#f8f9fb', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>CREATOR / AFFILIATE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{formatMoney(prodActiveSales * 0.22)}</div>
                  <div style={{ fontSize: '11px', color: '#ff5c00', fontWeight: 700, marginTop: '2px' }}>22% of Total Volume</div>
                </div>

                <div style={{ background: '#f8f9fb', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>B2B & WHOLESALE</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{formatMoney(prodActiveSales * 0.13)}</div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700, marginTop: '2px' }}>13% of Total Volume</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 7: ORDER DIAGNOSTICS ================= */}
        {activeView === 'order' && (
          <div className="page-view active-view">
            <div className="content-card">
              <div className="card-header-row">
                <div>
                  <div className="card-title">Order Pipeline Diagnostics (2,355 Units)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Dedicated pipeline breakdown for supply chain and fulfillment velocity.
                  </div>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fulfillment Channel</th>
                    <th>Units Queued</th>
                    <th>Avg Value</th>
                    <th>Gross Volume</th>
                    <th>Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Direct Online Pre-orders</strong></td>
                    <td>1,530 units</td>
                    <td>{formatMoney(activeProduct ? activeProduct.retail_price : 389)}</td>
                    <td>{formatMoney(1530 * (activeProduct ? activeProduct.retail_price : 389))}</td>
                    <td><span style={{ color: '#12b76a', fontWeight: 700 }}>Batch 1 Ready</span></td>
                  </tr>
                  <tr>
                    <td><strong>Developer Community Drops</strong></td>
                    <td>525 units</td>
                    <td>{formatMoney((activeProduct ? activeProduct.retail_price : 389) * 0.9)}</td>
                    <td>{formatMoney(525 * (activeProduct ? activeProduct.retail_price : 389) * 0.9)}</td>
                    <td><span style={{ color: '#ff5c00', fontWeight: 700 }}>In Transit</span></td>
                  </tr>
                  <tr>
                    <td><strong>Seed Startup B2B 4-Packs</strong></td>
                    <td>300 units</td>
                    <td>{formatMoney(1499 / 4)}</td>
                    <td>{formatMoney(300 * 374)}</td>
                    <td><span style={{ color: '#3b82f6', fontWeight: 700 }}>Commercial Signed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VIEW 8: CUSTOMER PERSONAS ================= */}
        {activeView === 'customer' && (
          <div className="page-view active-view">
            <div className="card-header-row">
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Ideal Customer Profiles (ICP) & Audiences</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="content-card">
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ff5c00', textTransform: 'uppercase' }}>Primary Persona</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>Senior Remote Software Engineers</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginTop: '8px' }}>
                  Ages 28–42, working from home full-time. High disposable income, suffers from chronic lower-back stiffness. Values distraction-free cable setups, solid natural bamboo textures, and silent dual whisper motors.
                </p>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                  Key Channels: <strong>Hacker News, r/battlestations, Twitter tech creators</strong>
                </div>
              </div>

              <div className="content-card">
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>Secondary Persona</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>Founders & Seed Stage Tech Hubs</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginTop: '8px' }}>
                  Equipping team spaces with modern hardware stipends. They care about 5-year warranties, rapid white-glove setup, and multi-unit pack savings.
                </p>
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
                  Key Channels: <strong>Direct HR outreach, Y Combinator founder directories</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 9: MCP CONFIGURATION ================= */}
        {activeView === 'mcp' && (
          <div className="page-view active-view">
            <div className="content-card">
              <div className="card-header-row">
                <div className="card-title">Claude Desktop Model Context Protocol (MCP) Node</div>
                <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                  ● SERVER LIVE ON PORT 8000
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6', marginBottom: '16px' }}>
                LaunchPulse exposes deterministic GTM tools to Claude Desktop via stdio. <strong>Zero AI code resides inside the web portal</strong>. 
                Add this configuration block to your Claude Desktop config file:
              </p>

              <div style={{ background: '#111827', color: '#f3f4f6', padding: '16px', borderRadius: '12px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', overflowX: 'auto', marginBottom: '16px' }}>
                <pre>{`{
  "mcpServers": {
    "launchpulse-gtm": {
      "command": "python",
      "args": ["d:/don't_know/Assignment 1/mcp-server/server.py"]
    }
  }
}`}</pre>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Exposed MCP Tools:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ background: '#f8f9fb', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>create_gtm_product</strong>: Onboard brand-new innovations into the GTM pipeline with market research.
                </li>
                <li style={{ background: '#f8f9fb', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>implement_gtm_strategy</strong>: Apply pricing shifts or channel campaigns dynamically to lift the sales curve.
                </li>
                <li style={{ background: '#f8f9fb', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>get_gtm_products</strong>: Pull active portfolio data for Claude's diagnostic reasoning.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ================= VIEW 10: SETTINGS ================= */}
        {activeView === 'settings' && (
          <div className="page-view active-view">
            <div className="content-card">
              <div className="card-title" style={{ marginBottom: '14px' }}>Studio Configuration</div>
              <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                <p><strong>Environment:</strong> Production / Local Hybrid</p>
                <p><strong>Backend API:</strong> http://localhost:8000 (FastAPI + SQLite)</p>
                <p><strong>Frontend:</strong> React 19 + Vite + Tailwind CSS</p>
                <p><strong>Zero-AI Invariant:</strong> Validated. No external LLM API tokens stored in web application.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: UPLOAD PRODUCT (START FROM SCRATCH VS HISTORICAL DATA) ================= */}
      {showUploadModal && (
        <div className="modal-backdrop show" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Upload & Onboard Product</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Toggle: Brand New Product vs Existing Product */}
            <div style={{ display: 'flex', background: '#f1f3f7', padding: '4px', borderRadius: '10px', marginBottom: '18px' }}>
              <button 
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: !isExistingProductMode ? '#ffffff' : 'transparent',
                  color: !isExistingProductMode ? '#111827' : '#64748b',
                  boxShadow: !isExistingProductMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
                onClick={() => setIsExistingProductMode(false)}
              >
                Brand New (Start from Scratch)
              </button>
              <button 
                type="button"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: isExistingProductMode ? '#ffffff' : 'transparent',
                  color: isExistingProductMode ? '#111827' : '#64748b',
                  boxShadow: isExistingProductMode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
                onClick={() => setIsExistingProductMode(true)}
              >
                Existing (Import Historical Data)
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Aura Flow Headset" 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry / Category</label>
                <select 
                  className="form-input"
                  value={newProductIndustry}
                  onChange={(e) => setNewProductIndustry(e.target.value)}
                >
                  <option value="Ergonomic Hardware & Workspace Tech">Ergonomic Hardware & Workspace Tech</option>
                  <option value="Sleep & Wellness Hardware">Sleep & Wellness Hardware</option>
                  <option value="SaaS & Developer Tools">SaaS & Developer Tools</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Retail Target Price ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Cost ($)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(Number(e.target.value))}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Positioning Hook</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Core value proposition hook" 
                  value={newProductHook}
                  onChange={(e) => setNewProductHook(e.target.value)}
                />
              </div>

              {/* Conditional Historical Sales Section */}
              {isExistingProductMode && (
                <div style={{ background: '#f8f9fb', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #eceef2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Previous 12-Month Sales History ($)</label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: '#ff5c00', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => setHistoricalSalesInput('15000, 16200, 19500, 21000, 22400, 24000, 25500, 27000, 29000, 31000, 33500, 36000')}
                    >
                      Fill Sample Data
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={historicalSalesInput}
                    onChange={(e) => setHistoricalSalesInput(e.target.value)}
                    placeholder="12 monthly figures separated by commas"
                  />
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Historical sales anchor the initial performance curve instead of synthetic benchmark targets.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-white" 
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gtm-action">
                  Save & Initialize Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

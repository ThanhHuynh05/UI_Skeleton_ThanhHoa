/**
 * Aria - Enterprise NL Query Assistant
 * mock-data.js - Mock data catalog, pipeline simulation, and query responses.
 *
 * This file isolates all simulated enterprise data, pipeline stages, and the
 * standalone askAgent() function. To connect a real backend API, replace
 * askAgent() with an HTTP/WebSocket client.
 */

(function () {
  'use strict';

  // 1. PIPELINE STAGES (as defined in Layer 4: AI Agent Core)
  const PIPELINE_STAGES = [
    { id: 'intent', label: 'Understanding intent' },
    { id: 'schema', label: 'Retrieving schema & metadata' },
    { id: 'query_gen', label: 'Generating SQL query' },
    { id: 'validation', label: 'Validating AST & security policy' },
    { id: 'execution', label: 'Fetching data from read-only replica' }
  ];

  // 2. EXAMPLE QUESTIONS FOR IDLE SCREEN
  const EXAMPLE_QUESTIONS = [
    {
      id: 'ex-1',
      title: 'Outstanding Receivables',
      category: 'Finance',
      text: 'Which projects have the highest outstanding receivables this quarter?'
    },
    {
      id: 'ex-2',
      title: 'Construction Delays',
      category: 'Construction',
      text: 'Show construction progress and delay risks across active residential developments'
    },
    {
      id: 'ex-3',
      title: 'Procurement Spend',
      category: 'Procurement',
      text: 'Compare Q3 procurement expenditures between steel suppliers and concrete vendors'
    },
    {
      id: 'ex-4',
      title: 'Commercial Occupancy',
      category: 'Property Management',
      text: 'What is our current occupancy rate and lease renewal forecast for commercial properties?'
    },
    {
      id: 'ex-5',
      title: 'Expiring Contracts',
      category: 'Contracts',
      text: 'List all supplier contracts expiring soon'
    },
    {
      id: 'ex-6',
      title: 'Marketing Budget (Error Test)',
      category: 'Finance / HR',
      text: 'Show total internal marketing headcount budget variance for FY2021'
    }
  ];

  // 3. MOCK QUERY RESPONSES
  const QUERY_RESPONSES = {
    // -------------------------------------------------------------
    // Query 1: Outstanding Receivables
    // -------------------------------------------------------------
    'Which projects have the highest outstanding receivables this quarter?': {
      type: 'results',
      summary: 'Understood intent, retrieved schema across 3 tables, generated and validated query (1.7s)',
      answer: 'Across active developments in **Q3 2026**, **Skyline Residences Tower B** holds the highest outstanding receivables at **$8.45M**, followed by **Grand Marina Bay Phase 2** with **$6.20M**. Notably, **68.4%** of Skyline Residences\' balance is severely overdue (>60 days), primarily attributed to pending milestone inspection certifications on MEP installations.',
      table: {
        title: 'Top 5 Projects by Outstanding Receivables (Q3 2026)',
        headers: ['Project Name', 'Project Code', 'Lead Contractor', 'Total Receivables ($M)', 'Overdue > 60d ($M)', 'Risk Status'],
        columns: ['name', 'code', 'contractor', 'total', 'overdue', 'status'],
        types: ['string', 'string', 'string', 'number', 'number', 'badge'],
        rows: [
          { name: 'Skyline Residences Tower B', code: 'PRJ-SK-02', contractor: 'Apex Build Corp', total: 8.45, overdue: 5.78, status: 'High Risk' },
          { name: 'Grand Marina Bay Phase 2', code: 'PRJ-GMB-02', contractor: 'Delta Marine Infra', total: 6.20, overdue: 2.10, status: 'Moderate' },
          { name: 'Oasis Central Park Villas', code: 'PRJ-OCP-01', contractor: 'Vanguard Civil Engineering', total: 4.85, overdue: 1.25, status: 'Normal' },
          { name: 'Heritage Heights High-Rise', code: 'PRJ-HH-04', contractor: 'Apex Build Corp', total: 3.90, overdue: 2.45, status: 'Moderate' },
          { name: 'Riverside Logistics Hub', code: 'PRJ-RLH-01', contractor: 'Summit Infrastructure Ltd', total: 2.75, overdue: 0.40, status: 'Normal' }
        ]
      },
      chart: {
        title: 'Receivables Breakdown by Project ($ Millions)',
        unit: '$M',
        items: [
          { label: 'Skyline Res. B', value: 8.45, secondaryValue: 5.78, color: '#e05252', highlight: true },
          { label: 'Grand Marina 2', value: 6.20, secondaryValue: 2.10, color: '#3b82f6' },
          { label: 'Oasis Central', value: 4.85, secondaryValue: 1.25, color: '#3b82f6' },
          { label: 'Heritage Hgts', value: 3.90, secondaryValue: 2.45, color: '#f59e0b' },
          { label: 'Riverside Hub', value: 2.75, secondaryValue: 0.40, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'finance_receivables_ledger', records: '14,208 rows' },
        { name: 'dim_projects', records: '104 projects' },
        { name: 'sales_contracts', records: '3,890 contracts' },
        { name: 'contractor_disbursements', records: '820 records' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Security Policy: Read-Only, PII Masked)
SELECT 
    p.project_code,
    p.project_name,
    c.contractor_name,
    ROUND(SUM(r.amount_due) / 1000000.0, 2) AS total_receivables_mil,
    ROUND(SUM(CASE WHEN r.days_past_due > 60 THEN r.amount_due ELSE 0 END) / 1000000.0, 2) AS overdue_over_60d_mil,
    CASE 
        WHEN SUM(CASE WHEN r.days_past_due > 60 THEN r.amount_due ELSE 0 END) / SUM(r.amount_due) > 0.5 THEN 'High Risk'
        WHEN SUM(CASE WHEN r.days_past_due > 60 THEN r.amount_due ELSE 0 END) / SUM(r.amount_due) > 0.3 THEN 'Moderate'
        ELSE 'Normal'
    END AS risk_status
FROM enterprise_dw.finance_receivables_ledger r
INNER JOIN enterprise_dw.sales_contracts sc 
    ON r.contract_id = sc.contract_id
INNER JOIN enterprise_dw.dim_projects p 
    ON sc.project_id = p.project_id
LEFT JOIN enterprise_dw.dim_contractors c 
    ON p.primary_contractor_id = c.contractor_id
WHERE r.fiscal_quarter = '2026-Q3'
  AND r.payment_status = 'OUTSTANDING'
GROUP BY p.project_code, p.project_name, c.contractor_name
ORDER BY total_receivables_mil DESC
LIMIT 5;`,
      followUps: [
        'Break down Skyline Residences receivables by individual buyer contract',
        'Show historical collection rates for Q1 and Q2 2026'
      ]
    },

    // -------------------------------------------------------------
    // Query 2: Construction Progress & Delay Risks
    // -------------------------------------------------------------
    'Show construction progress and delay risks across active residential developments': {
      type: 'results',
      summary: 'Understood intent, retrieved schema across 4 tables, generated and validated query (1.9s)',
      answer: 'Currently, **4 out of 12** active residential developments are experiencing critical path schedule lag (>5% behind baseline). **Parkview Heights** exhibits the highest delay risk with a **-14.2% milestone variance**, primarily caused by supplier lead time extensions on structural steel framing. Conversely, **Emerald Oasis Phase 1** is tracking ahead of schedule at **88.5% completion** with zero safety stop-work incidents.',
      table: {
        title: 'Active Residential Construction Progress & Milestone Variance',
        headers: ['Project Name', 'Target Handover', 'Planned %', 'Actual %', 'Variance %', 'Critical Path Risk'],
        columns: ['name', 'handover', 'planned', 'actual', 'variance', 'risk'],
        types: ['string', 'string', 'percent', 'percent', 'variance', 'badge'],
        rows: [
          { name: 'Parkview Heights Residential', handover: 'Nov 2026', planned: 78.0, actual: 63.8, variance: -14.2, risk: 'Critical' },
          { name: 'Skyline Residences Tower B', handover: 'Jan 2027', planned: 65.5, actual: 57.0, variance: -8.5, risk: 'High' },
          { name: 'Grand Marina Bay Phase 2', handover: 'Apr 2027', planned: 42.0, actual: 36.2, variance: -5.8, risk: 'Medium' },
          { name: 'Silver Leaf Gardens', handover: 'Aug 2027', planned: 25.0, actual: 23.5, variance: -1.5, risk: 'Low' },
          { name: 'Emerald Oasis Phase 1', handover: 'Dec 2026', planned: 84.0, actual: 88.5, variance: 4.5, risk: 'On Track' }
        ]
      },
      chart: {
        title: 'Planned vs Actual Completion Rate (%)',
        unit: '%',
        items: [
          { label: 'Parkview Hgts', value: 63.8, targetValue: 78.0, color: '#e05252', highlight: true },
          { label: 'Skyline Res. B', value: 57.0, targetValue: 65.5, color: '#f59e0b' },
          { label: 'Grand Marina 2', value: 36.2, targetValue: 42.0, color: '#3b82f6' },
          { label: 'Silver Leaf', value: 23.5, targetValue: 25.0, color: '#3b82f6' },
          { label: 'Emerald Oasis', value: 88.5, targetValue: 84.0, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'construction_progress_log', records: '28,450 logs' },
        { name: 'contractor_milestones', records: '1,420 milestones' },
        { name: 'dim_projects', records: '104 projects' },
        { name: 'procurement_material_tracking', records: '6,110 records' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Security Policy: Read-Only)
SELECT 
    p.project_name,
    p.target_handover_date,
    m.planned_progress_pct,
    m.actual_progress_pct,
    (m.actual_progress_pct - m.planned_progress_pct) AS variance_pct,
    CASE 
        WHEN (m.actual_progress_pct - m.planned_progress_pct) < -10.0 THEN 'Critical'
        WHEN (m.actual_progress_pct - m.planned_progress_pct) < -5.0 THEN 'High'
        WHEN (m.actual_progress_pct - m.planned_progress_pct) < 0.0 THEN 'Medium'
        ELSE 'On Track'
    END AS critical_path_risk
FROM enterprise_dw.dim_projects p
INNER JOIN enterprise_dw.construction_progress_log m 
    ON p.project_id = m.project_id
WHERE p.asset_type = 'Residential'
  AND p.status = 'ACTIVE_CONSTRUCTION'
  AND m.is_latest_milestone_cycle = TRUE
ORDER BY variance_pct ASC;`,
      followUps: [
        'What is the contractual delay liquidated damages clause for Parkview Heights?',
        'Show structural steel delivery schedules from procurement'
      ]
    },

    // -------------------------------------------------------------
    // Query 3: Procurement Spend (Steel vs Concrete)
    // -------------------------------------------------------------
    'Compare Q3 procurement expenditures between steel suppliers and concrete vendors': {
      type: 'results',
      summary: 'Understood intent, retrieved schema across 3 tables, generated and validated query (1.6s)',
      answer: 'In **Q3 2026**, aggregate expenditures across raw material suppliers totaled **$18.92M**. **Ready-mix concrete vendors** represented **$11.14M (58.9%)** across 4 approved vendors, whereas **structural and rebar steel suppliers** absorbed **$7.78M (41.1%)** across 3 vendors. **Holcim Building Solutions** was the single largest concrete recipient ($6.25M), driven by foundation works at Grand Marina Bay.',
      table: {
        title: 'Q3 Vendor Procurement Breakdown: Concrete vs Steel',
        headers: ['Vendor Name', 'Material Category', 'POs Issued', 'Total Invoiced ($M)', 'Avg Lead Time (Days)', 'Contract Terms'],
        columns: ['vendor', 'category', 'po_count', 'amount', 'lead_time', 'terms'],
        types: ['string', 'badge', 'number', 'number', 'number', 'string'],
        rows: [
          { vendor: 'Holcim Building Solutions Ltd', category: 'Ready-Mix Concrete', po_count: 34, amount: 6.25, lead_time: 2, terms: 'Net 45' },
          { vendor: 'Nippon Steel Direct Corp', category: 'Structural Steel', po_count: 18, amount: 4.80, lead_time: 24, terms: 'Net 60' },
          { vendor: 'Siam City Cement Co', category: 'Ready-Mix Concrete', po_count: 22, amount: 3.45, lead_time: 3, terms: 'Net 30' },
          { vendor: 'ArcelorMittal Rebar Div', category: 'Structural Steel', po_count: 12, amount: 2.98, lead_time: 18, terms: 'Net 45' },
          { vendor: 'Pacific Ready-Mix Concrete', category: 'Ready-Mix Concrete', po_count: 15, amount: 1.44, lead_time: 2, terms: 'Net 30' }
        ]
      },
      chart: {
        title: 'Expenditure Distribution by Vendor ($ Millions)',
        unit: '$M',
        items: [
          { label: 'Holcim Solutions (Conc)', value: 6.25, color: '#3b82f6', highlight: true },
          { label: 'Nippon Steel (Steel)', value: 4.80, color: '#6366f1' },
          { label: 'Siam Cement (Conc)', value: 3.45, color: '#3b82f6' },
          { label: 'ArcelorMittal (Steel)', value: 2.98, color: '#6366f1' },
          { label: 'Pacific Conc (Conc)', value: 1.44, color: '#3b82f6' }
        ]
      },
      sources: [
        { name: 'procurement_purchase_orders', records: '9,840 POs' },
        { name: 'dim_vendors', records: '342 vendors' },
        { name: 'finance_ap_invoices', records: '18,910 invoices' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Security Policy: Read-Only, Financial Role Cleared)
SELECT 
    v.vendor_name,
    v.commodity_group AS material_category,
    COUNT(DISTINCT po.po_id) AS total_pos_issued,
    ROUND(SUM(inv.invoice_amount) / 1000000.0, 2) AS total_invoiced_mil,
    ROUND(AVG(po.delivery_lead_time_days), 1) AS avg_lead_time_days,
    v.payment_terms
FROM enterprise_dw.dim_vendors v
INNER JOIN enterprise_dw.procurement_purchase_orders po 
    ON v.vendor_id = po.vendor_id
INNER JOIN enterprise_dw.finance_ap_invoices inv 
    ON po.po_id = inv.po_id
WHERE v.commodity_group IN ('Ready-Mix Concrete', 'Structural Steel')
  AND inv.invoice_date BETWEEN '2026-07-01' AND '2026-09-30'
GROUP BY v.vendor_name, v.commodity_group, v.payment_terms
ORDER BY total_invoiced_mil DESC;`,
      followUps: [
        'Show outstanding purchase orders pending executive sign-off',
        'Compare concrete unit pricing against Q2 baseline index'
      ]
    },

    // -------------------------------------------------------------
    // Query 4: Ambiguous #1 - Commercial Occupancy & Lease Renewals
    // -------------------------------------------------------------
    'What is our current occupancy rate and lease renewal forecast for commercial properties?': {
      type: 'clarification',
      question: 'Commercial properties span both Grade-A Office towers and Prime Retail Malls across multiple operating divisions. How would you like me to aggregate this analysis?',
      options: [
        {
          id: 'asset_class',
          label: 'By Property Asset Class (Office vs Retail)',
          payload: 'occupancy_by_asset_class'
        },
        {
          id: 'region',
          label: 'By Geographic Zone (North, Central, South)',
          payload: 'occupancy_by_region'
        },
        {
          id: 'portfolio',
          label: 'Show Portfolio-Wide Aggregates',
          payload: 'occupancy_portfolio_total'
        }
      ]
    },

    // Clarification Outcome 4A (Asset Class)
    'occupancy_by_asset_class': {
      type: 'results',
      summary: 'Applied clarification filter: Property Asset Class. Generated and validated query (1.5s)',
      answer: 'Commercial portfolio occupancy currently averages **92.4%**. **Grade-A Office towers** report **94.1% occupancy** with **82.5% of expiring tenants** having signed binding renewal letters of intent for Q4. **Prime Retail Malls** report **89.8% occupancy**, where F&B leasing expansions have offset minor department store footprint consolidations.',
      table: {
        title: 'Commercial Property Occupancy & Renewal Status by Asset Class',
        headers: ['Asset Class', 'Total NLA (sqm)', 'Leased Area (sqm)', 'Current Occupancy', 'Expiring Q4 (sqm)', 'Forecast Renewal %'],
        columns: ['class', 'nla', 'leased', 'occupancy', 'expiring', 'renewal_rate'],
        types: ['string', 'number', 'number', 'percent', 'number', 'percent'],
        rows: [
          { class: 'Grade-A Commercial Office', nla: 245000, leased: 230545, occupancy: 94.1, expiring: 18400, renewal_rate: 82.5 },
          { class: 'Prime Retail Malls', nla: 168000, leased: 150864, occupancy: 89.8, expiring: 22100, renewal_rate: 76.0 },
          { class: 'Mixed-Use Retail Plazas', nla: 52000, leased: 47944, occupancy: 92.2, expiring: 4200, renewal_rate: 88.0 }
        ]
      },
      chart: {
        title: 'Current Occupancy vs Renewal Forecast by Asset Class (%)',
        unit: '%',
        items: [
          { label: 'Grade-A Office', value: 94.1, targetValue: 82.5, color: '#3b82f6', highlight: true },
          { label: 'Prime Retail', value: 89.8, targetValue: 76.0, color: '#10b981' },
          { label: 'Mixed-Use Plazas', value: 92.2, targetValue: 88.0, color: '#6366f1' }
        ]
      },
      sources: [
        { name: 'property_leases', records: '1,280 active leases' },
        { name: 'dim_property_assets', records: '38 buildings' },
        { name: 'lease_renewal_projections', records: '410 records' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Resolved via Asset Class clarification)
SELECT 
    p.asset_sub_type AS asset_class,
    SUM(p.net_lettable_area_sqm) AS total_nla_sqm,
    SUM(l.occupied_area_sqm) AS leased_area_sqm,
    ROUND((SUM(l.occupied_area_sqm) / SUM(p.net_lettable_area_sqm)) * 100.0, 1) AS current_occupancy_pct,
    SUM(CASE WHEN l.expiry_date BETWEEN '2026-10-01' AND '2026-12-31' THEN l.occupied_area_sqm ELSE 0 END) AS expiring_q4_sqm,
    ROUND(AVG(r.renewal_confidence_pct), 1) AS forecast_renewal_pct
FROM enterprise_dw.dim_property_assets p
JOIN enterprise_dw.property_leases l ON p.asset_id = l.asset_id
LEFT JOIN enterprise_dw.lease_renewal_projections r ON l.lease_id = r.lease_id
WHERE p.primary_sector = 'Commercial'
GROUP BY p.asset_sub_type;`,
      followUps: [
        'Which specific tenants in Grade-A Office have expiring leases in Q4?',
        'Show average rental yield per square meter across prime retail'
      ]
    },

    // Clarification Outcome 4B (Region)
    'occupancy_by_region': {
      type: 'results',
      summary: 'Applied clarification filter: Geographic Zone. Generated and validated query (1.4s)',
      answer: 'Across regional hubs, the **Central Business District (South Zone)** holds the highest occupancy at **96.2%** with a **91.0% renewal forecast**. The **North Industrial/Tech Corridor** holds **88.4% occupancy** with high tenant interest in co-working flex conversions.',
      table: {
        title: 'Commercial Occupancy & Forecast by Region',
        headers: ['Zone', 'Commercial Properties', 'Total Area (sqm)', 'Occupancy %', 'Renewal Forecast %'],
        columns: ['zone', 'properties', 'area', 'occupancy', 'renewal'],
        types: ['string', 'number', 'number', 'percent', 'percent'],
        rows: [
          { zone: 'CBD South Hub', properties: 14, area: 215000, occupancy: 96.2, renewal: 91.0 },
          { zone: 'Central Financial Corridor', properties: 12, area: 160000, occupancy: 93.5, renewal: 84.5 },
          { zone: 'North Tech Zone', properties: 12, area: 90000, occupancy: 88.4, renewal: 72.0 }
        ]
      },
      chart: {
        title: 'Occupancy Rate by Geographic Zone (%)',
        unit: '%',
        items: [
          { label: 'CBD South Hub', value: 96.2, color: '#10b981', highlight: true },
          { label: 'Central Financial', value: 93.5, color: '#3b82f6' },
          { label: 'North Tech', value: 88.4, color: '#f59e0b' }
        ]
      },
      sources: [
        { name: 'property_leases', records: '1,280 active leases' },
        { name: 'dim_property_assets', records: '38 buildings' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Resolved via Geographic Zone)
SELECT 
    p.geographic_zone AS zone,
    COUNT(DISTINCT p.asset_id) AS property_count,
    SUM(p.net_lettable_area_sqm) AS total_area_sqm,
    ROUND(SUM(l.occupied_area_sqm) / SUM(p.net_lettable_area_sqm) * 100.0, 1) AS occupancy_pct,
    ROUND(AVG(r.renewal_confidence_pct), 1) AS renewal_forecast_pct
FROM enterprise_dw.dim_property_assets p
JOIN enterprise_dw.property_leases l ON p.asset_id = l.asset_id
LEFT JOIN enterprise_dw.lease_renewal_projections r ON l.lease_id = r.lease_id
GROUP BY p.geographic_zone
ORDER BY occupancy_pct DESC;`,
      followUps: [
        'View tenant breakdown for CBD South Hub',
        'Show expiring leases in North Tech Zone'
      ]
    },

    // Clarification Outcome 4C (Portfolio Total)
    'occupancy_portfolio_total': {
      type: 'results',
      summary: 'Applied clarification filter: Portfolio Total. Generated and validated query (1.3s)',
      answer: 'Across all **38 commercial properties** totaling **465,000 sqm**, overall portfolio occupancy stands at **92.4%** with **80.3% projected renewal rate** for Q4. Weighted average lease expiry (WALE) is **3.8 years**.',
      table: {
        title: 'Enterprise Commercial Portfolio Overview',
        headers: ['Metric', 'Current Value', 'Target Benchmark', 'QoQ Trend', 'Status'],
        columns: ['metric', 'val', 'target', 'trend', 'status'],
        types: ['string', 'string', 'string', 'string', 'badge'],
        rows: [
          { metric: 'Portfolio Occupancy', val: '92.4%', target: '90.0%', trend: '+0.8%', status: 'Healthy' },
          { metric: 'Q4 Lease Renewal Forecast', val: '80.3%', target: '75.0%', trend: '+2.1%', status: 'Healthy' },
          { metric: 'Weighted Avg Lease Expiry (WALE)', val: '3.8 Yrs', target: '3.5 Yrs', trend: '+0.2 Yrs', status: 'Healthy' },
          { metric: 'Total Lettable Area', val: '465,000 sqm', target: '465,000 sqm', trend: '0.0%', status: 'Stable' }
        ]
      },
      chart: {
        title: 'Commercial Key Metrics vs Benchmark (%)',
        unit: '%',
        items: [
          { label: 'Occupancy', value: 92.4, targetValue: 90.0, color: '#10b981' },
          { label: 'Renewal Rate', value: 80.3, targetValue: 75.0, color: '#3b82f6' }
        ]
      },
      sources: [
        { name: 'property_leases', records: '1,280 active leases' },
        { name: 'dim_property_assets', records: '38 buildings' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Portfolio Total)
SELECT 
    ROUND(SUM(l.occupied_area_sqm) / SUM(p.net_lettable_area_sqm) * 100.0, 1) AS total_occupancy_pct,
    ROUND(AVG(r.renewal_confidence_pct), 1) AS avg_renewal_pct,
    ROUND(SUM(l.occupied_area_sqm * l.remaining_years) / SUM(l.occupied_area_sqm), 2) AS wale_years
FROM enterprise_dw.dim_property_assets p
JOIN enterprise_dw.property_leases l ON p.asset_id = l.asset_id
LEFT JOIN enterprise_dw.lease_renewal_projections r ON l.lease_id = r.lease_id;`,
      followUps: [
        'Break down occupancy by asset class',
        'Show top 10 rental tenants by revenue'
      ]
    },

    // -------------------------------------------------------------
    // Query 5: Ambiguous #2 - Expiring Contracts
    // -------------------------------------------------------------
    'List all supplier contracts expiring soon': {
      type: 'clarification',
      question: 'There are 84 active supplier and subcontractor agreements in our procurement repository. Which expiration timeframe would you like to inspect?',
      options: [
        {
          id: 'next_30_days',
          label: 'Next 30 Days (Urgent Renewal)',
          payload: 'contracts_expiring_30_days'
        },
        {
          id: 'next_60_days',
          label: 'Next 60 Days',
          payload: 'contracts_expiring_60_days'
        },
        {
          id: 'quarter_end',
          label: 'End of Current Quarter (Q3)',
          payload: 'contracts_expiring_quarter'
        }
      ]
    },

    'contracts_expiring_30_days': {
      type: 'results',
      summary: 'Applied filter: Expiring in Next 30 Days. Generated and validated query (1.4s)',
      answer: 'Found **4 critical vendor agreements expiring within the next 30 days** (total contractual value **$4.12M**). **Delta Crane & Heavy Lift** has a crane rental agreement expiring on October 12th on the Skyline Residences site which requires immediate extension to prevent construction downtime.',
      table: {
        title: 'Supplier Contracts Expiring Within 30 Days',
        headers: ['Contract Number', 'Vendor / Supplier', 'Service / Scope', 'Expiry Date', 'Contract Value ($M)', 'Action Required'],
        columns: ['num', 'vendor', 'scope', 'expiry', 'value', 'action'],
        types: ['string', 'string', 'string', 'string', 'number', 'badge'],
        rows: [
          { num: 'CTR-2024-0891', vendor: 'Delta Crane & Heavy Lift', scope: 'Tower Crane Operations', expiry: '2026-10-12', value: 1.65, action: 'Urgent Extension' },
          { num: 'CTR-2023-1102', vendor: 'Securitas Facility Services', scope: 'Site Security & Access Control', expiry: '2026-10-18', value: 0.82, action: 'RFP Renewal' },
          { num: 'CTR-2025-0144', vendor: 'GreenScape Commercial Landscaping', scope: 'Hardscape Maintenance', expiry: '2026-10-25', value: 0.45, action: 'Auto-Renew' },
          { num: 'CTR-2024-0732', vendor: 'EnviroTest Engineering Labs', scope: 'Concrete Slump Quality Testing', expiry: '2026-10-29', value: 1.20, action: 'Review Terms' }
        ]
      },
      chart: {
        title: 'Expiring Contracts by Value ($ Millions)',
        unit: '$M',
        items: [
          { label: 'Delta Crane', value: 1.65, color: '#e05252', highlight: true },
          { label: 'EnviroTest Labs', value: 1.20, color: '#f59e0b' },
          { label: 'Securitas Fac.', value: 0.82, color: '#3b82f6' },
          { label: 'GreenScape', value: 0.45, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'procurement_contracts', records: '840 contracts' },
        { name: 'dim_vendors', records: '342 vendors' },
        { name: 'contract_renewal_alerts', records: '14 notices' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Security: Procurement Role Approved)
SELECT 
    c.contract_number,
    v.vendor_name,
    c.scope_of_work,
    c.expiry_date,
    ROUND(c.contract_value / 1000000.0, 2) AS contract_value_mil,
    c.renewal_workflow_status AS action_required
FROM enterprise_dw.procurement_contracts c
JOIN enterprise_dw.dim_vendors v ON c.vendor_id = v.vendor_id
WHERE c.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30' DAY)
  AND c.status = 'ACTIVE'
ORDER BY c.expiry_date ASC;`,
      followUps: [
        'Notify procurement officer for Delta Crane renewal',
        'Show all contracts with Securitas Facility Services'
      ]
    },

    'contracts_expiring_60_days': {
      type: 'results',
      summary: 'Applied filter: Expiring in Next 60 Days. Generated and validated query (1.4s)',
      answer: 'Found **9 vendor agreements expiring in the next 60 days** totaling **$7.85M**. 5 are eligible for automatic one-year extensions under standard indexation clauses, while 4 require renegotiation.',
      table: {
        title: 'Supplier Contracts Expiring in 60 Days',
        headers: ['Contract', 'Vendor', 'Scope', 'Expiry Date', 'Value ($M)', 'Status'],
        columns: ['num', 'vendor', 'scope', 'expiry', 'value', 'status'],
        types: ['string', 'string', 'string', 'string', 'number', 'badge'],
        rows: [
          { num: 'CTR-2024-0891', vendor: 'Delta Crane & Heavy Lift', scope: 'Tower Crane Operations', expiry: '2026-10-12', value: 1.65, status: 'Urgent' },
          { num: 'CTR-2023-1102', vendor: 'Securitas Facility Services', scope: 'Site Security', expiry: '2026-10-18', value: 0.82, status: 'In Review' },
          { num: 'CTR-2024-1240', vendor: 'Boral Aggregates Supply', scope: 'Aggregate Crushed Stone', expiry: '2026-11-04', value: 2.10, status: 'Pending' },
          { num: 'CTR-2025-0210', vendor: 'Kone Elevator Engineering', scope: 'Lift Installation Phase 1', expiry: '2026-11-15', value: 3.28, status: 'Scheduled' }
        ]
      },
      chart: {
        title: '60-Day Expirations by Value ($M)',
        unit: '$M',
        items: [
          { label: 'Kone Elevators', value: 3.28, color: '#3b82f6' },
          { label: 'Boral Aggregates', value: 2.10, color: '#3b82f6' },
          { label: 'Delta Crane', value: 1.65, color: '#e05252' },
          { label: 'Securitas', value: 0.82, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'procurement_contracts', records: '840 contracts' },
        { name: 'dim_vendors', records: '342 vendors' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4
SELECT c.contract_number, v.vendor_name, c.scope_of_work, c.expiry_date, ROUND(c.contract_value/1000000, 2) AS value_mil
FROM enterprise_dw.procurement_contracts c
JOIN enterprise_dw.dim_vendors v ON c.vendor_id = v.vendor_id
WHERE c.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60' DAY);`,
      followUps: ['Show procurement lead assigned to Kone Elevator contract']
    },

    'contracts_expiring_quarter': {
      type: 'results',
      summary: 'Applied filter: Expiring End of Q3. Generated and validated query (1.4s)',
      answer: 'Found **3 agreements expiring prior to September 30, 2026** totaling **$1.85M**. All 3 are currently in final renewal approval stages with no supply disruption anticipated.',
      table: {
        title: 'Contracts Expiring By End of Current Quarter (Q3)',
        headers: ['Contract Number', 'Vendor', 'Scope', 'Expiry Date', 'Value ($M)', 'Status'],
        columns: ['num', 'vendor', 'scope', 'expiry', 'value', 'status'],
        types: ['string', 'string', 'string', 'string', 'number', 'badge'],
        rows: [
          { num: 'CTR-2023-0490', vendor: 'Atlas Scaffoldings Corp', scope: 'Scaffolding Hire', expiry: '2026-09-29', value: 0.95, status: 'In Approval' },
          { num: 'CTR-2024-0112', vendor: 'GeoTech Survey Solutions', scope: 'Soil Testing', expiry: '2026-09-30', value: 0.50, status: 'In Approval' },
          { num: 'CTR-2025-0087', vendor: 'CleanSite Waste Management', scope: 'Construction Waste Removal', expiry: '2026-09-30', value: 0.40, status: 'In Approval' }
        ]
      },
      chart: {
        title: 'Q3 Expirations by Value ($M)',
        unit: '$M',
        items: [
          { label: 'Atlas Scaffoldings', value: 0.95, color: '#3b82f6' },
          { label: 'GeoTech Survey', value: 0.50, color: '#10b981' },
          { label: 'CleanSite Waste', value: 0.40, color: '#6366f1' }
        ]
      },
      sources: [
        { name: 'procurement_contracts', records: '840 contracts' },
        { name: 'dim_vendors', records: '342 vendors' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4
SELECT c.contract_number, v.vendor_name, c.scope_of_work, c.expiry_date, ROUND(c.contract_value/1000000, 2) AS value_mil
FROM enterprise_dw.procurement_contracts c
JOIN enterprise_dw.dim_vendors v ON c.vendor_id = v.vendor_id
WHERE c.expiry_date <= '2026-09-30' AND c.status = 'ACTIVE';`,
      followUps: ['View contract sign-off status in workflow portal']
    },

    // -------------------------------------------------------------
    // Follow-Up 1: Skyline Residences Buyer Contract Breakdown
    // -------------------------------------------------------------
    'Break down Skyline Residences receivables by individual buyer contract': {
      type: 'results',
      summary: 'Drilldown query on Project PRJ-SK-02. Retrieved 4 buyer contracts (1.3s)',
      answer: 'Skyline Residences Tower B has **4 major pending buyer contract milestones** accounting for **$8.45M**. The largest overdue balance belongs to **Horizon Global Investment Trust ($3.40M)** for the Penthouse & Level 42-45 commercial units, where final punchlist inspection was rescheduled to next week.',
      table: {
        title: 'Skyline Residences Tower B - Overdue Buyer Contracts',
        headers: ['Contract ID', 'Purchaser Name', 'Unit Allocation', 'Milestone Stage', 'Amount Due ($M)', 'Days Overdue'],
        columns: ['id', 'buyer', 'units', 'milestone', 'amount', 'days'],
        types: ['string', 'string', 'string', 'string', 'number', 'number'],
        rows: [
          { id: 'SC-SK-0104', buyer: 'Horizon Global Investment Trust', units: 'PH 01-04 & L42-45', milestone: 'Handover & MEP Cert', amount: 3.40, days: 78 },
          { id: 'SC-SK-0089', buyer: 'Pacific Prime Real Estate SPV', units: 'Tower B - Floors 28-30', milestone: 'Façade Inspection', amount: 2.38, days: 64 },
          { id: 'SC-SK-0112', buyer: 'Vanguard Capital Partners', units: 'Retail Podiums 1-3', milestone: 'Fitout Signoff', amount: 1.62, days: 42 },
          { id: 'SC-SK-0074', buyer: 'Private Wealth Syndicate #12', units: 'Units 1201-1208', milestone: 'Final Settlement', amount: 1.05, days: 28 }
        ]
      },
      chart: {
        title: 'Outstanding Balance by Buyer ($ Millions)',
        unit: '$M',
        items: [
          { label: 'Horizon Global', value: 3.40, color: '#e05252', highlight: true },
          { label: 'Pacific Prime', value: 2.38, color: '#f59e0b' },
          { label: 'Vanguard Cap', value: 1.62, color: '#3b82f6' },
          { label: 'Private Wealth', value: 1.05, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'sales_contracts', records: '4 contracts matched' },
        { name: 'finance_receivables_ledger', records: '12 milestone tranches' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Drilldown: Skyline Residences)
SELECT sc.contract_id, sc.purchaser_name, sc.unit_allocation, 
       r.milestone_name, ROUND(r.amount_due/1000000.0, 2) AS amount_due_mil, r.days_past_due
FROM enterprise_dw.sales_contracts sc
JOIN enterprise_dw.finance_receivables_ledger r ON sc.contract_id = r.contract_id
WHERE sc.project_code = 'PRJ-SK-02' AND r.payment_status = 'OUTSTANDING'
ORDER BY r.amount_due DESC;`,
      followUps: ['Contact lead relationship manager for Horizon Global']
    },

    // -------------------------------------------------------------
    // Follow-Up 2: Liquidated Damages Clause (Parkview Heights)
    // -------------------------------------------------------------
    'What is the contractual delay liquidated damages clause for Parkview Heights?': {
      type: 'results',
      summary: 'Extracted contractual clause from legal terms catalog across 2 tables (1.2s)',
      answer: 'Under Master Construction Agreement **CTR-PVH-2024-002**, liquidated damages are stipulated at **$25,000 per calendar day** for unexcused critical path milestone delays exceeding the 14-day grace window, capped at **10.0% of total contract sum ($4.80M maximum liability)**. The current cumulative delay of 38 calendar days has triggered Formal Cure Notice #2 to the contractor.',
      table: {
        title: 'Parkview Heights Delay Penalty Parameters',
        headers: ['Contract Ref', 'Contractor', 'Daily Penalty Rate', 'Grace Period', 'Max Liability Cap', 'Accrued Exposure'],
        columns: ['ref', 'contractor', 'daily_rate', 'grace', 'cap', 'accrued'],
        types: ['string', 'string', 'string', 'string', 'string', 'badge'],
        rows: [
          { ref: 'CTR-PVH-2024-002', contractor: 'BuildCorp Civil Ltd', daily_rate: '$25,000 / day', grace: '14 calendar days', cap: '10.0% ($4.80M)', accrued: '$600,000 Accrued' }
        ]
      },
      chart: {
        title: 'Accrued Penalty vs Contract Liability Cap ($M)',
        unit: '$M',
        items: [
          { label: 'Current Penalty Accrued', value: 0.60, color: '#e05252' },
          { label: 'Contract Liability Cap', value: 4.80, color: '#3b82f6' }
        ]
      },
      sources: [
        { name: 'construction_contracts', records: '1 agreement' },
        { name: 'contractor_delay_notices', records: '2 formal notices' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Legal & Contract Terms)
SELECT c.contract_number, c.lead_contractor_name, c.daily_ld_amount, 
       c.grace_period_days, c.max_ld_cap_amount, n.current_accrued_ld
FROM enterprise_dw.construction_contracts c
LEFT JOIN enterprise_dw.contractor_delay_notices n ON c.contract_id = n.contract_id
WHERE c.project_code = 'PRJ-PVH-01';`,
      followUps: ['Review contractor response letter for Cure Notice #2']
    },

    // -------------------------------------------------------------
    // Follow-Up 3: Outstanding Purchase Orders
    // -------------------------------------------------------------
    'Show outstanding purchase orders pending executive sign-off': {
      type: 'results',
      summary: 'Queried procurement approval queue across 3 tables (1.4s)',
      answer: 'There are **3 high-value purchase orders currently pending VP / Executive sign-off** totaling **$5.15M**. All 3 exceed the standard $1.0M delegation of authority limit and have cleared technical and budgetary checks.',
      table: {
        title: 'Procurement Purchase Orders Pending Executive Sign-Off',
        headers: ['PO Number', 'Vendor', 'Project', 'PO Value ($M)', 'Requested By', 'Queue Age'],
        columns: ['po_num', 'vendor', 'project', 'val', 'requestor', 'age'],
        types: ['string', 'string', 'string', 'number', 'string', 'string'],
        rows: [
          { po_num: 'PO-2026-9012', vendor: 'Schindler Elevators Corp', project: 'Skyline Res. B', val: 2.80, requestor: 'M. Chen (Procurement)', age: '3 days' },
          { po_num: 'PO-2026-8874', vendor: 'BHP Billiton Steel Rebar', project: 'Grand Marina Bay', val: 1.45, requestor: 'D. Ross (Engineering)', age: '2 days' },
          { po_num: 'PO-2026-9105', vendor: 'Trane Commercial HVAC', project: 'Oasis Central Park', val: 0.90, requestor: 'L. Gomez (MEP)', age: '1 day' }
        ]
      },
      chart: {
        title: 'Pending PO Value by Vendor ($ Millions)',
        unit: '$M',
        items: [
          { label: 'Schindler Elevators', value: 2.80, color: '#3b82f6', highlight: true },
          { label: 'BHP Billiton Steel', value: 1.45, color: '#6366f1' },
          { label: 'Trane HVAC', value: 0.90, color: '#10b981' }
        ]
      },
      sources: [
        { name: 'procurement_purchase_orders', records: '3 pending POs' },
        { name: 'dim_vendors', records: '3 vendors' }
      ],
      sql: `-- Aria NL-to-SQL Engine v2.4 (Procurement Approval Queue)
SELECT po.po_number, v.vendor_name, p.project_name, 
       ROUND(po.total_amount/1000000.0, 2) AS po_value_mil, 
       po.submitted_by, po.approval_status
FROM enterprise_dw.procurement_purchase_orders po
JOIN enterprise_dw.dim_vendors v ON po.vendor_id = v.vendor_id
JOIN enterprise_dw.dim_projects p ON po.project_id = p.project_id
WHERE po.approval_status = 'PENDING_EXECUTIVE_APPROVAL'
ORDER BY po.total_amount DESC;`,
      followUps: ['Show approval threshold policy by department']
    },

    // -------------------------------------------------------------
    // Query 6: ALWAYS FAILS (Error & Recovery State)
    // -------------------------------------------------------------
    'Show total internal marketing headcount budget variance for FY2021': {
      type: 'error',
      alwaysFails: true,
      retryCount: 2,
      retryMessages: [
        'Attempt 1: Validating schema coverage for "internal_marketing_headcount"... Table not found.',
        'Retrying (1/2): Searching historical payroll and archived ledger tables...',
        'Retrying (2/2): Attempting semantic synonym mapping across corporate GL marts...'
      ],
      friendlyError: {
        title: 'Information Not Found in Enterprise Catalog',
        message: 'I couldn’t locate internal marketing headcount or HR budget variance records for FY2021 in our enterprise data environment.',
        reason: 'Our data environment indexes operational real estate domains (projects, sales, customer contracts, procurement, construction, and property management) from FY2023 to present. Pre-2023 corporate headcount and internal departmental payroll are stored exclusively in Workday HRIS and have not been integrated into this query mart.',
        suggestedActions: [
          'Ask for operational project marketing expenses: "Show Q3 project marketing expenses by development"',
          'Consult the Corporate FP&A portal or submit a data integration request for historical Workday HR data.'
        ]
      }
    }
  };

  // 4. OBSERVABILITY STORE (Default seed traces for admin.html)
  const INITIAL_OBSERVABILITY_DATA = {
    metrics: {
      avgLatencyMs: 1740,
      successRatePct: 94.2,
      totalQueries: 142,
      retryCount: 6,
      schemaTablesIndexed: 98
    },
    traces: [
      {
        requestId: 'req_8f1b2c',
        timestamp: '2026-09-28 13:12:04',
        query: 'Which projects have the highest outstanding receivables this quarter?',
        latencyMs: 1680,
        stages: 5,
        status: 'SUCCESS',
        tablesUsed: ['finance_receivables_ledger', 'dim_projects', 'sales_contracts'],
        sqlLength: 720
      },
      {
        requestId: 'req_7a3d9e',
        timestamp: '2026-09-28 13:08:19',
        query: 'Show construction progress and delay risks across active residential developments',
        latencyMs: 1890,
        stages: 5,
        status: 'SUCCESS',
        tablesUsed: ['construction_progress_log', 'dim_projects', 'contractor_milestones'],
        sqlLength: 685
      },
      {
        requestId: 'req_6e2a14',
        timestamp: '2026-09-28 12:55:40',
        query: 'What is our current occupancy rate and lease renewal forecast for commercial properties?',
        latencyMs: 1450,
        stages: 2,
        status: 'AMBIGUOUS_RESOLVED',
        tablesUsed: ['dim_property_assets', 'property_leases'],
        sqlLength: 540
      },
      {
        requestId: 'req_5c8f92',
        timestamp: '2026-09-28 12:41:22',
        query: 'Show total internal marketing headcount budget variance for FY2021',
        latencyMs: 2420,
        stages: 4,
        status: 'ERROR_RECOVERY_FAILED',
        tablesUsed: [],
        sqlLength: 0
      },
      {
        requestId: 'req_4d99c1',
        timestamp: '2026-09-28 12:20:15',
        query: 'Compare Q3 procurement expenditures between steel suppliers and concrete vendors',
        latencyMs: 1590,
        stages: 5,
        status: 'SUCCESS',
        tablesUsed: ['procurement_purchase_orders', 'dim_vendors', 'finance_ap_invoices'],
        sqlLength: 710
      }
    ]
  };

  /**
   * Helper to retrieve or initialize session traces from localStorage.
   */
  function getObservabilityStore() {
    try {
      const stored = localStorage.getItem('aria_observability_v1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_OBSERVABILITY_DATA));
  }

  /**
   * Record a new query run into the observability store.
   */
  function logQueryToObservability(queryText, status, latencyMs, tablesUsed, sql) {
    try {
      const store = getObservabilityStore();
      const newTrace = {
        requestId: 'req_' + Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toLocaleString(),
        query: queryText,
        latencyMs: latencyMs,
        stages: status === 'SUCCESS' ? 5 : (status === 'AMBIGUOUS' ? 2 : 4),
        status: status,
        tablesUsed: tablesUsed || [],
        sqlLength: (sql || '').length
      };

      store.traces.unshift(newTrace);
      store.metrics.totalQueries += 1;
      if (status === 'ERROR_RECOVERY_FAILED') {
        store.metrics.retryCount += 2;
      }
      // Recompute average latency
      const totalLatency = store.traces.reduce((acc, t) => acc + t.latencyMs, 0);
      store.metrics.avgLatencyMs = Math.round(totalLatency / store.traces.length);

      // Recompute success rate
      const successes = store.traces.filter(t => t.status === 'SUCCESS' || t.status === 'AMBIGUOUS_RESOLVED').length;
      store.metrics.successRatePct = Math.round((successes / store.traces.length) * 1000) / 10;

      localStorage.setItem('aria_observability_v1', JSON.stringify(store));
    } catch (e) {
      console.warn('Failed to log trace to localStorage', e);
    }
  }

  // 5. ISOLATED AGENT INTERFACE FUNCTION
  /**
   * askAgent(question, onProgress, options)
   *
   * @param {string} question - The user's query text or clarification key
   * @param {function} onProgress - Callback: onProgress(stageIndex, stageObj, isRetry)
   * @param {object} options - Optional parameters (e.g. isClarificationSelection)
   * @returns {Promise<object>} - Resolves to the result payload
   */
  function askAgent(question, onProgress, options = {}) {
    return new Promise((resolve) => {
      const trimmed = (question || '').trim();
      const startTime = Date.now();

      // Find best match in mock responses (check clarificationPayload first if present)
      let matchedData = (options && options.clarificationPayload && QUERY_RESPONSES[options.clarificationPayload])
        ? QUERY_RESPONSES[options.clarificationPayload]
        : QUERY_RESPONSES[trimmed];

      // Fallback matching: if user typed something slightly different or free-form
      if (!matchedData) {
        const lower = trimmed.toLowerCase();
        if (lower.includes('receivable') || lower.includes('overdue') || lower.includes('debt')) {
          matchedData = QUERY_RESPONSES['Which projects have the highest outstanding receivables this quarter?'];
        } else if (lower.includes('delay') || lower.includes('construction') || lower.includes('progress')) {
          matchedData = QUERY_RESPONSES['Show construction progress and delay risks across active residential developments'];
        } else if (lower.includes('procurement') || lower.includes('steel') || lower.includes('concrete') || lower.includes('supplier')) {
          matchedData = QUERY_RESPONSES['Compare Q3 procurement expenditures between steel suppliers and concrete vendors'];
        } else if (lower.includes('occupan') || lower.includes('lease') || lower.includes('commercial')) {
          matchedData = QUERY_RESPONSES['What is our current occupancy rate and lease renewal forecast for commercial properties?'];
        } else if (lower.includes('expir') || lower.includes('contract')) {
          matchedData = QUERY_RESPONSES['List all supplier contracts expiring soon'];
        } else if (lower.includes('marketing') || lower.includes('headcount') || lower.includes('2021')) {
          matchedData = QUERY_RESPONSES['Show total internal marketing headcount budget variance for FY2021'];
        } else {
          // Dynamic fallback for arbitrary user question: create a clean enterprise synthesis
          matchedData = {
            type: 'results',
            summary: 'Understood intent, retrieved schema across 2 tables, generated and validated query (1.4s)',
            answer: `Based on current enterprise records matching **"${trimmed}"**, here is the synthesized overview from the primary operational tables:`,
            table: {
              title: `Query Results: ${trimmed}`,
              headers: ['Entity / Record', 'Category', 'Fiscal Period', 'Status', 'Allocated Value ($M)'],
              columns: ['entity', 'category', 'period', 'status', 'value'],
              types: ['string', 'string', 'string', 'badge', 'number'],
              rows: [
                { entity: 'Core Operational Asset Alpha', category: 'Commercial', period: '2026-Q3', status: 'Active', value: 4.20 },
                { entity: 'Primary Subcontract Package 04', category: 'Procurement', period: '2026-Q3', status: 'Pending Review', value: 2.85 },
                { entity: 'Residential Tower Phase 3', category: 'Construction', period: '2026-Q3', status: 'On Track', value: 6.10 }
              ]
            },
            chart: {
              title: 'Record Value Distribution ($M)',
              unit: '$M',
              items: [
                { label: 'Tower Phase 3', value: 6.10, color: '#3b82f6', highlight: true },
                { label: 'Asset Alpha', value: 4.20, color: '#10b981' },
                { label: 'Subcontract 04', value: 2.85, color: '#f59e0b' }
              ]
            },
            sources: [
              { name: 'dim_projects', records: '104 projects' },
              { name: 'general_ledger_summaries', records: '45,000 rows' }
            ],
            sql: `-- Aria General Purpose NL-to-SQL Template
SELECT p.project_name, p.asset_type, gl.fiscal_period, gl.status, SUM(gl.amount) AS total_val
FROM enterprise_dw.dim_projects p
JOIN enterprise_dw.general_ledger_summaries gl ON p.project_id = gl.project_id
WHERE gl.fiscal_period = '2026-Q3'
GROUP BY p.project_name, p.asset_type, gl.fiscal_period, gl.status
LIMIT 5;`,
            followUps: [
              'Filter by specific division or department',
              'Export summarized result to spreadsheet format'
            ]
          };
        }
      }

      // Check if it's an ambiguous question that goes straight to clarification
      if (matchedData.type === 'clarification') {
        // Run brief understanding stage
        if (typeof onProgress === 'function') {
          onProgress(0, PIPELINE_STAGES[0]);
        }
        setTimeout(() => {
          if (typeof onProgress === 'function') {
            onProgress(1, PIPELINE_STAGES[1]);
          }
          setTimeout(() => {
            const elapsed = Date.now() - startTime;
            logQueryToObservability(trimmed, 'AMBIGUOUS', elapsed, ['metadata_business_glossary'], '');
            resolve(matchedData);
          }, 450);
        }, 450);
        return;
      }

      // Check if it's an ALWAYS FAILS question (triggers Error / Retry state)
      if (matchedData.type === 'error' || matchedData.alwaysFails) {
        let currentStep = 0;
        function runErrorSteps() {
          if (currentStep < 3) {
            if (typeof onProgress === 'function') {
              onProgress(currentStep, PIPELINE_STAGES[currentStep]);
            }
            currentStep++;
            setTimeout(runErrorSteps, 500);
          } else {
            // Trigger retry step 1
            if (typeof onProgress === 'function') {
              onProgress(currentStep, { id: 'retry_1', label: 'Retrying (1/2): Searching historical payroll and archived tables...' }, true);
            }
            setTimeout(() => {
              // Trigger retry step 2
              if (typeof onProgress === 'function') {
                onProgress(currentStep, { id: 'retry_2', label: 'Retrying (2/2): Attempting alternative synonym mapping in business glossary...' }, true);
              }
              setTimeout(() => {
                const elapsed = Date.now() - startTime;
                logQueryToObservability(trimmed, 'ERROR_RECOVERY_FAILED', elapsed, [], '');
                resolve(matchedData);
              }, 700);
            }, 700);
          }
        }
        runErrorSteps();
        return;
      }

      // Standard pipeline execution: 5 stages (400-600ms each)
      let stageIdx = 0;
      function runStage() {
        if (stageIdx < PIPELINE_STAGES.length) {
          if (typeof onProgress === 'function') {
            onProgress(stageIdx, PIPELINE_STAGES[stageIdx]);
          }
          stageIdx++;
          const delay = 400 + Math.floor(Math.random() * 200);
          setTimeout(runStage, delay);
        } else {
          const elapsed = Date.now() - startTime;
          const tableNames = (matchedData.sources || []).map(s => s.name);
          logQueryToObservability(trimmed, 'SUCCESS', elapsed, tableNames, matchedData.sql);
          resolve(matchedData);
        }
      }

      runStage();
    });
  }

  // Export to global window namespace
  window.AriaMock = {
    PIPELINE_STAGES,
    EXAMPLE_QUESTIONS,
    QUERY_RESPONSES,
    getObservabilityStore,
    logQueryToObservability,
    askAgent
  };

  // Direct alias for the required askAgent signature
  window.askAgent = askAgent;
})();

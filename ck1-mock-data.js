(function () {
  'use strict';

  const tables = {
    'public.projects': [
      { id: 'prj-skyline', project_code: 'PRJ-SK-02', project_name: 'Skyline Residences', project_type: 'Residential', status: 'Active', total_units: 420, estimated_cost: 185000000, estimated_cost_currency: 'USD', expected_completion_year: 2027 },
      { id: 'prj-marina', project_code: 'PRJ-GMB-02', project_name: 'Grand Marina Bay Phase 2', project_type: 'Mixed Use', status: 'Active', total_units: 310, estimated_cost: 142000000, estimated_cost_currency: 'USD', expected_completion_year: 2026 },
      { id: 'prj-parkview', project_code: 'PRJ-PVH-01', project_name: 'Parkview Heights', project_type: 'Residential', status: 'Active', total_units: 260, estimated_cost: 98000000, estimated_cost_currency: 'USD', expected_completion_year: 2026 }
    ],
    'public.buildings': [
      { id: 'bld-sky-b', project_id: 'prj-skyline', building_name: 'Skyline Tower B', status: 'Under Construction', total_units: 180, rentable_area_sqm: 28400 },
      { id: 'bld-marina-a', project_id: 'prj-marina', building_name: 'Marina Commercial Tower', status: 'Operational', total_units: 120, rentable_area_sqm: 36200 },
      { id: 'bld-park-a', project_id: 'prj-parkview', building_name: 'Parkview Tower A', status: 'Operational', total_units: 96, rentable_area_sqm: 14800 }
    ],
    'public.project_phases': [
      { id: 'phase-sky-3', project_id: 'prj-skyline', phase_name: 'Tower Structure and MEP', phase_number: 3, status: 'In Progress', total_units_in_phase: 180, expected_handover_date: '2027-06-30' },
      { id: 'phase-marina-2', project_id: 'prj-marina', phase_name: 'Commercial Fit-out', phase_number: 2, status: 'In Progress', total_units_in_phase: 120, expected_handover_date: '2026-12-15' },
      { id: 'phase-park-4', project_id: 'prj-parkview', phase_name: 'Handover', phase_number: 4, status: 'Delayed', total_units_in_phase: 96, expected_handover_date: '2026-11-30' }
    ],
    'public.units': [
      { id: 'unit-sky-4201', project_id: 'prj-skyline', building_id: 'bld-sky-b', phase_id: 'phase-sky-3', unit_code: 'SK-B-4201', area_sqm: 286, use_type: 'Residential', status: 'Sold', visibility: 'Private' },
      { id: 'unit-sky-1804', project_id: 'prj-skyline', building_id: 'bld-sky-b', phase_id: 'phase-sky-3', unit_code: 'SK-B-1804', area_sqm: 142, use_type: 'Residential', status: 'Sold', visibility: 'Private' },
      { id: 'unit-mar-1201', project_id: 'prj-marina', building_id: 'bld-marina-a', phase_id: 'phase-marina-2', unit_code: 'GMB-A-1201', area_sqm: 410, use_type: 'Office', status: 'Occupied', visibility: 'Public' },
      { id: 'unit-mar-1202', project_id: 'prj-marina', building_id: 'bld-marina-a', phase_id: 'phase-marina-2', unit_code: 'GMB-A-1202', area_sqm: 360, use_type: 'Office', status: 'Vacant', visibility: 'Public' },
      { id: 'unit-park-0801', project_id: 'prj-parkview', building_id: 'bld-park-a', phase_id: 'phase-park-4', unit_code: 'PV-A-0801', area_sqm: 118, use_type: 'Residential', status: 'Occupied', visibility: 'Private' },
      { id: 'unit-park-0802', project_id: 'prj-parkview', building_id: 'bld-park-a', phase_id: 'phase-park-4', unit_code: 'PV-A-0802', area_sqm: 115, use_type: 'Residential', status: 'Occupied', visibility: 'Private' }
    ],
    'public.customers': [
      { id: 'cus-horizon', customer_type: 'Corporate', full_name: 'Horizon Global Investment Trust', email: 'finance@horizon.example', customer_status: 'Active', account_tier: 'Enterprise' },
      { id: 'cus-pacific', customer_type: 'Corporate', full_name: 'Pacific Prime SPV', email: 'accounts@pacific.example', customer_status: 'Active', account_tier: 'Enterprise' },
      { id: 'cus-vanguard', customer_type: 'Corporate', full_name: 'Vanguard Capital', email: 'property@vanguard.example', customer_status: 'Active', account_tier: 'Enterprise' },
      { id: 'cus-amelia', customer_type: 'Individual', full_name: 'Amelia Hart', email: 'amelia@example.com', customer_status: 'Active', account_tier: 'Premium' }
    ],
    'public.sales_contracts': [
      { id: 'ctr-sky-104', contract_number: 'CTR-SK-2026-0104', customer_id: 'cus-horizon', unit_id: 'unit-sky-4201', contract_type: 'Sale', status: 'Active', total_value: 14500000, deposit_amount: 1450000, payment_type: 'Installments', signed_date: '2026-01-18', start_date: '2026-01-18', end_date: '2027-06-30' },
      { id: 'ctr-sky-089', contract_number: 'CTR-SK-2026-0089', customer_id: 'cus-pacific', unit_id: 'unit-sky-1804', contract_type: 'Sale', status: 'Active', total_value: 9200000, deposit_amount: 920000, payment_type: 'Installments', signed_date: '2026-02-07', start_date: '2026-02-07', end_date: '2027-04-30' },
      { id: 'ctr-mar-112', contract_number: 'CTR-GMB-2026-0112', customer_id: 'cus-vanguard', unit_id: 'unit-mar-1201', contract_type: 'Sale', status: 'Active', total_value: 8400000, deposit_amount: 1680000, payment_type: 'Milestone', signed_date: '2026-03-12', start_date: '2026-03-12', end_date: '2026-12-31' },
      { id: 'ctr-park-044', contract_number: 'CTR-PVH-2026-0044', customer_id: 'cus-amelia', unit_id: 'unit-park-0801', contract_type: 'Sale', status: 'Active', total_value: 3100000, deposit_amount: 310000, payment_type: 'Installments', signed_date: '2026-04-09', start_date: '2026-04-09', end_date: '2026-11-30' }
    ],
    'public.payment_schedules': [
      { id: 'sch-sky-104', contract_id: 'ctr-sky-104', schedule_type: 'Construction Milestone', total_installments: 4, installment_amount: 3262500, frequency: 'Milestone', start_date: '2026-03-31' },
      { id: 'sch-sky-089', contract_id: 'ctr-sky-089', schedule_type: 'Quarterly', total_installments: 4, installment_amount: 2070000, frequency: 'Quarterly', start_date: '2026-03-31' },
      { id: 'sch-mar-112', contract_id: 'ctr-mar-112', schedule_type: 'Construction Milestone', total_installments: 3, installment_amount: 2240000, frequency: 'Milestone', start_date: '2026-04-30' }
    ],
    'public.payment_installments': [
      { id: 'ins-sky-104-1', schedule_id: 'sch-sky-104', installment_number: 1, due_date: '2026-06-30', amount_due: 3262500, amount_paid: 1200000, status: 'Partially Paid', paid_date: '2026-07-03' },
      { id: 'ins-sky-104-2', schedule_id: 'sch-sky-104', installment_number: 2, due_date: '2026-09-30', amount_due: 3262500, amount_paid: 0, status: 'Overdue', paid_date: null },
      { id: 'ins-sky-089-1', schedule_id: 'sch-sky-089', installment_number: 1, due_date: '2026-06-30', amount_due: 2070000, amount_paid: 800000, status: 'Partially Paid', paid_date: '2026-07-01' },
      { id: 'ins-mar-112-1', schedule_id: 'sch-mar-112', installment_number: 1, due_date: '2026-08-31', amount_due: 2240000, amount_paid: 2240000, status: 'Paid', paid_date: '2026-08-28' },
      { id: 'ins-mar-112-2', schedule_id: 'sch-mar-112', installment_number: 2, due_date: '2026-11-30', amount_due: 2240000, amount_paid: 0, status: 'Scheduled', paid_date: null }
    ],
    'public.payment_transactions': [
      { id: 'pay-001', installment_id: 'ins-sky-104-1', contract_id: 'ctr-sky-104', amount: 1200000, payment_method: 'Bank Transfer', transaction_ref: 'TRX-260703-01', transaction_date: '2026-07-03T09:30:00Z' },
      { id: 'pay-002', installment_id: 'ins-sky-089-1', contract_id: 'ctr-sky-089', amount: 800000, payment_method: 'Bank Transfer', transaction_ref: 'TRX-260701-04', transaction_date: '2026-07-01T14:15:00Z' },
      { id: 'pay-003', installment_id: 'ins-mar-112-1', contract_id: 'ctr-mar-112', amount: 2240000, payment_method: 'Bank Transfer', transaction_ref: 'TRX-260828-08', transaction_date: '2026-08-28T10:20:00Z' }
    ],
    'public.construction_progress': [
      { id: 'prog-sky-sep', project_id: 'prj-skyline', phase_id: 'phase-sky-3', report_date: '2026-09-30', progress_percentage: 71.8, milestone: 'MEP rough-in', notes: 'On baseline' },
      { id: 'prog-mar-sep', project_id: 'prj-marina', phase_id: 'phase-marina-2', report_date: '2026-09-30', progress_percentage: 84.2, milestone: 'Tenant fit-out', notes: '2.0% ahead of baseline' },
      { id: 'prog-park-sep', project_id: 'prj-parkview', phase_id: 'phase-park-4', report_date: '2026-09-30', progress_percentage: 68.4, milestone: 'Pre-handover inspection', notes: '14.2% behind baseline' }
    ],
    'public.tenants': [
      { id: 'tenant-vanguard', customer_id: 'cus-vanguard' },
      { id: 'tenant-horizon', customer_id: 'cus-horizon' },
      { id: 'tenant-amelia', customer_id: 'cus-amelia' }
    ],
    'public.lease_contracts': [
      { id: 'lease-mar-01', unit_id: 'unit-mar-1201', tenant_id: 'tenant-vanguard', lease_start: '2024-01-01', lease_end: '2027-12-31', monthly_rent: 92000, currency: 'USD', status: 'Active' },
      { id: 'lease-park-01', unit_id: 'unit-park-0801', tenant_id: 'tenant-horizon', lease_start: '2025-05-01', lease_end: '2026-12-31', monthly_rent: 4600, currency: 'USD', status: 'Active' },
      { id: 'lease-park-02', unit_id: 'unit-park-0802', tenant_id: 'tenant-amelia', lease_start: '2026-01-15', lease_end: '2027-01-14', monthly_rent: 4300, currency: 'USD', status: 'Active' }
    ],
    'public.vendors': [
      { id: 'ven-delta', vendor_name: 'Delta Crane and Heavy Lift', category: 'Equipment Rental', rating: 4.6, is_active: true },
      { id: 'ven-elevate', vendor_name: 'Elevate Facilities Services', category: 'Facilities Management', rating: 4.4, is_active: true },
      { id: 'ven-secure', vendor_name: 'SecureCore Systems', category: 'Building Security', rating: 4.7, is_active: true }
    ],
    'public.service_contracts': [
      { id: 'svc-delta', vendor_id: 'ven-delta', project_id: 'prj-skyline', service_type: 'Crane Rental', contract_start: '2026-01-01', contract_end: '2026-10-12', monthly_fee: 125000, status: 'Active' },
      { id: 'svc-elevate', vendor_id: 'ven-elevate', project_id: 'prj-marina', service_type: 'Facilities Management', contract_start: '2025-11-01', contract_end: '2026-11-05', monthly_fee: 84000, status: 'Active' },
      { id: 'svc-secure', vendor_id: 'ven-secure', project_id: 'prj-parkview', service_type: 'Building Security', contract_start: '2026-02-01', contract_end: '2027-01-31', monthly_fee: 42000, status: 'Active' }
    ],
    'platform.data_access_policies': [
      { id: 'pol-sales-contracts', role_id: 'role-sales-manager', domain: 'Sales & Contracts', table_schema: 'public', table_name: 'sales_contracts', column_name: null, access_level: 'allow', masking_rule: null, row_filter: 'status = Active', priority: 100, is_active: true },
      { id: 'pol-customer-pii', role_id: 'role-sales-manager', domain: 'Customer Identity', table_schema: 'public', table_name: 'customers', column_name: 'national_id_masked', access_level: 'mask', masking_rule: 'show_last_4', row_filter: null, priority: 200, is_active: true }
    ],
    'platform.audit_logs': [
      { id: 'audit-001', occurred_at: '2026-09-30T12:15:37Z', user_id: 'user-admin', action: 'NL_QUERY', table_schema: 'public', table_name: 'sales_contracts', nl_question: 'Show total active contract value by project this year', policy_decision: 'ALLOW', details: { rows_returned: 3 } },
      { id: 'audit-002', occurred_at: '2026-09-30T11:48:12Z', user_id: 'user-sales', action: 'NL_QUERY', table_schema: 'public', table_name: 'customers', nl_question: 'Show customer national IDs', policy_decision: 'MASK', details: { masked_columns: ['national_id_masked'] } }
    ]
  };

  const supportedQuestions = [
    { domain: 'Sales & Contracts', metric: 'Active contract value', text: 'Show total active contract value by project in calendar year 2026' },
    { domain: 'Sales & Contracts', metric: 'Contract value composition', text: 'Show the composition of active contract value by project in calendar year 2026' },
    { domain: 'Finance & Accounting', metric: 'Outstanding installments', text: 'Which projects have the highest outstanding buyer installments in 2026?' },
    { domain: 'Finance & Accounting', metric: 'Monthly collected payments', text: 'Show monthly buyer payments collected from July to September 2026' },
    { domain: 'Sales & Contracts', metric: 'Overdue installments', text: 'Break down Skyline Residences overdue installments by buyer contract' },
    { domain: 'Projects & Property', metric: 'Construction progress', text: 'Compare latest construction progress across active project phases' },
    { domain: 'Projects & Property', metric: 'Progress threshold variance', text: 'Compare each project’s latest construction progress with a 75% review threshold' },
    { domain: 'Property Operations', metric: 'Occupancy rate', text: 'What is the current occupied-unit rate by project?' },
    { domain: 'Property Operations', metric: 'Expiring service contracts', text: 'Which active service contracts expire in the next 60 days?' },
    { domain: 'Property Operations', metric: 'Active service vendors', text: 'List active property service vendors with their category and rating' },
    { domain: 'Property Operations', metric: 'Monthly service fees', text: 'Compare monthly service contract fees by project and vendor' },
    { domain: 'Security & Governance', metric: 'Masked fields', text: 'Show masked fields configured for the Sales Manager role' },
    { domain: 'Security & Governance', metric: 'Query audit events', text: 'Show recent natural-language query audit events' },
    { domain: 'Security & Governance', metric: 'Policy decisions', text: 'Summarise allow, mask, and deny decisions in recent query audit logs' }
  ];

  const curatedTableNames = new Set(Object.keys(tables));

  function stableUuid(seed) {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const suffix = (hash >>> 0).toString(16).padStart(8, '0');
    return `00000000-0000-4000-8000-${suffix.padStart(12, '0')}`;
  }

  function titleCase(value) {
    return String(value || '').split('_').filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function syntheticTextValue(table, columnName, rowNumber) {
    const name = columnName.toLowerCase();
    if (/email/.test(name)) return `demo.${table.name}.${rowNumber}@example.invalid`;
    if (/phone|mobile/.test(name)) return '+00-000-000-0000';
    if (/national_id|tax_id|passport|bank_account|password|secret|token/.test(name)) return '[SYNTHETIC-RESTRICTED]';
    if (/currency/.test(name)) return 'USD';
    if (/country/.test(name)) return 'Synthetic Market';
    if (/domain/.test(name)) return table.domain;
    if (/status|state/.test(name)) return ['Active', 'Pending', 'Completed'][(rowNumber - 1) % 3];
    if (/decision|access_level/.test(name)) return ['ALLOW', 'MASK', 'DENY'][(rowNumber - 1) % 3];
    if (/code|number|reference|_ref$/.test(name)) return `${table.name.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}-${String(rowNumber).padStart(3, '0')}`;
    if (/name|title|label/.test(name)) return `${titleCase(table.name)} ${rowNumber}`;
    if (/description|notes|comment|reason|details/.test(name)) return `Synthetic ${titleCase(table.name).toLowerCase()} example ${rowNumber} for CK1 demo coverage.`;
    if (/address/.test(name)) return `${rowNumber} Demo Street, Synthetic District`;
    if (/url|uri|path/.test(name)) return `https://example.invalid/${table.name}/${rowNumber}`;
    if (/type|category|method|frequency/.test(name)) return ['Standard', 'Priority', 'Special'][(rowNumber - 1) % 3];
    return `${titleCase(columnName)} ${rowNumber}`;
  }

  function syntheticColumnValue(table, column, rowNumber) {
    const type = String(column.type || '').toLowerCase();
    const name = String(column.name || '').toLowerCase();
    const seed = `${table.qualifiedName}:${column.name}:${rowNumber}`;

    if (type.includes('uuid')) return stableUuid(seed);
    if (type.includes('timestamp')) return `2026-${String(7 + rowNumber).padStart(2, '0')}-${String(8 + rowNumber).padStart(2, '0')}T0${rowNumber}:30:00Z`;
    if (type === 'date' || type.startsWith('date ')) return `2026-${String(7 + rowNumber).padStart(2, '0')}-${String(8 + rowNumber).padStart(2, '0')}`;
    if (type.includes('boolean')) return rowNumber % 2 === 1;
    if (type.includes('json')) return { synthetic: true, example: rowNumber, source: table.qualifiedName };
    if (type.includes('[]') || type.includes('array')) return [`synthetic-${rowNumber}`];
    if (/integer|smallint|bigint|serial/.test(type)) {
      if (/year/.test(name)) return 2025 + rowNumber;
      if (/month/.test(name)) return rowNumber;
      if (/day/.test(name)) return rowNumber * 10;
      if (/count|quantity|units|capacity/.test(name)) return rowNumber * 10;
      return rowNumber;
    }
    if (/numeric|decimal|double|real|money/.test(type)) {
      if (/percent|percentage|rate|ratio/.test(name)) return Number((20.5 + rowNumber * 12.5).toFixed(2));
      if (/amount|value|cost|price|fee|budget|revenue|rent|balance/.test(name)) return rowNumber * 125000;
      if (/area|sqm|size/.test(name)) return Number((85.5 + rowNumber * 24.25).toFixed(2));
      return Number((rowNumber * 10.25).toFixed(2));
    }
    return syntheticTextValue(table, column.name, rowNumber);
  }

  function generateRowsForTable(table, rowCount = 3) {
    return Array.from({ length: rowCount }, (_, index) => {
      const rowNumber = index + 1;
      return table.columns.reduce((row, column) => {
        row[column.name] = syntheticColumnValue(table, column, rowNumber);
        return row;
      }, {});
    });
  }

  const schema = window.CK1_SCHEMA;
  if (schema && Array.isArray(schema.tables)) {
    schema.tables.forEach(table => {
      if (!tables[table.qualifiedName]) tables[table.qualifiedName] = generateRowsForTable(table);
      const rows = tables[table.qualifiedName];
      rows.forEach((row, rowIndex) => {
        table.columns.forEach(column => {
          if (!Object.prototype.hasOwnProperty.call(row, column.name)) {
            row[column.name] = syntheticColumnValue(table, column, rowIndex + 1);
          }
        });
      });
      table.mockRowCount = rows.length;
      table.hasMockData = rows.length > 0;
      table.mockFixtureKind = curatedTableNames.has(table.qualifiedName) ? 'curated' : 'generated';
    });
  }

  window.CK1_MOCK_DATA = {
    version: 'ck1-demo-fixtures@1.1.0',
    generatedAt: '2026-10-07T00:00:00+07:00',
    currency: 'USD',
    synthetic: true,
    tables,
    supportedQuestions,
    getRows(qualifiedName) { return (tables[qualifiedName] || []).map(row => ({ ...row })); },
    getFixtureKind(qualifiedName) { return curatedTableNames.has(qualifiedName) ? 'curated' : (tables[qualifiedName] ? 'generated' : 'none'); },
    getCoverage() {
      const tableCount = schema && Array.isArray(schema.tables) ? schema.tables.length : 0;
      const mockedTableCount = schema && Array.isArray(schema.tables) ? schema.tables.filter(table => (tables[table.qualifiedName] || []).length > 0).length : 0;
      return { tableCount, mockedTableCount, complete: tableCount > 0 && tableCount === mockedTableCount };
    }
  };
})();

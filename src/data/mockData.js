// ---------------------------------------------------------------------------
// Mock data for DataOps Insight Hub (Phase 1-7 frontend development)
// All data is deterministic (seeded PRNG) so demos are stable across reloads.
// This module is the single source of truth until the FastAPI backend lands.
// ---------------------------------------------------------------------------

const TODAY = new Date('2026-10-08T11:00:00');

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDayLabel(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Users (mock credentials - REMOVE passwords before any production use)
// ---------------------------------------------------------------------------

export const MOCK_USERS = [
  { id: 1, name: 'Alex Morgan', email: 'admin@dataops.com', role: 'Admin', status: 'Active', lastLogin: '2026-10-08 09:12', password: 'Admin@123' },
  { id: 2, name: 'Priya Sharma', email: 'engineer@dataops.com', role: 'Data Engineer', status: 'Active', lastLogin: '2026-10-08 10:05', password: 'Engineer@123' },
  { id: 3, name: 'Sam Reyes', email: 'viewer@dataops.com', role: 'Viewer', status: 'Active', lastLogin: '2026-10-07 16:40', password: 'Viewer@123' },
  { id: 4, name: 'Sarah Kim', email: 'sarah.kim@dataops.com', role: 'Data Engineer', status: 'Active', lastLogin: '2026-10-08 08:20', password: 'Sarah@123' },
  { id: 5, name: 'Michael Chen', email: 'michael.chen@dataops.com', role: 'Viewer', status: 'Active', lastLogin: '2026-10-06 11:02', password: 'Michael@123' },
  { id: 6, name: 'Jessica Lopez', email: 'jessica.lopez@dataops.com', role: 'Data Engineer', status: 'Inactive', lastLogin: '2026-09-28 14:15', password: 'Jessica@123' },
  { id: 7, name: 'David Okafor', email: 'david.okafor@dataops.com', role: 'Viewer', status: 'Active', lastLogin: '2026-10-05 09:48', password: 'David@123' },
];

// ---------------------------------------------------------------------------
// Pipelines - 24 pipelines across CSV / API / Database sources
// ---------------------------------------------------------------------------

const PIPELINE_DEFS = [
  { id: 1,  name: 'Sales ETL',          source: 'Sales.csv',                 sourceType: 'CSV',      destination: 'SQL Server',      status: 'SUCCESS', duration: 12, recordsProcessed: 37452,  schedule: 'Every 30 min',  owner: 'Priya Sharma' },
  { id: 2,  name: 'Customer ETL',       source: 'CRM API',                   sourceType: 'API',      destination: 'SQL Server',      status: 'SUCCESS', duration: 15, recordsProcessed: 52180,  schedule: 'Hourly',        owner: 'Sarah Kim' },
  { id: 3,  name: 'Product ETL',        source: 'Products.csv',              sourceType: 'CSV',      destination: 'SQL Server',      status: 'FAILED',  duration: 18, recordsProcessed: 0,      schedule: 'Every 30 min',  owner: 'Priya Sharma' },
  { id: 4,  name: 'Inventory ETL',       source: 'WMS API',                   sourceType: 'API',      destination: 'SQL Server',      status: 'RUNNING', duration: 9,  recordsProcessed: 18930,  schedule: 'Every 15 min',  owner: 'Alex Morgan' },
  { id: 5,  name: 'Orders ETL',          source: 'OrdersDB',                  sourceType: 'Database', destination: 'SQL Server',      status: 'SUCCESS', duration: 22, recordsProcessed: 128940, schedule: 'Hourly',        owner: 'Sarah Kim' },
  { id: 6,  name: 'Marketing ETL',       source: 'Ads API',                   sourceType: 'API',      destination: 'Data Warehouse',  status: 'SUCCESS', duration: 14, recordsProcessed: 41260,  schedule: 'Every 2 hours', owner: 'Michael Chen' },
  { id: 7,  name: 'HR ETL',              source: 'HR.csv',                    sourceType: 'CSV',      destination: 'SQL Server',      status: 'SUCCESS', duration: 8,  recordsProcessed: 8940,   schedule: 'Daily 06:00',   owner: 'Alex Morgan' },
  { id: 8,  name: 'Finance ETL',         source: 'ERP API',                   sourceType: 'API',      destination: 'SQL Server',      status: 'SUCCESS', duration: 26, recordsProcessed: 67410,  schedule: 'Hourly',        owner: 'Sarah Kim' },
  { id: 9,  name: 'Shipping ETL',        source: 'Carrier API',               sourceType: 'API',      destination: 'SQL Server',      status: 'FAILED',  duration: 31, recordsProcessed: 0,      schedule: 'Every 30 min',  owner: 'Priya Sharma' },
  { id: 10, name: 'Returns ETL',         source: 'Returns.csv',               sourceType: 'CSV',      destination: 'SQL Server',      status: 'SUCCESS', duration: 11, recordsProcessed: 15780,  schedule: 'Every 2 hours', owner: 'Michael Chen' },
  { id: 11, name: 'Supplier ETL',        source: 'SupplierDB',                sourceType: 'Database', destination: 'SQL Server',      status: 'SUCCESS', duration: 17, recordsProcessed: 24630,  schedule: 'Daily 07:00',   owner: 'Alex Morgan' },
  { id: 12, name: 'Pricing ETL',         source: 'Pricing API',               sourceType: 'API',      destination: 'Data Warehouse',  status: 'RUNNING', duration: 6,  recordsProcessed: 9420,   schedule: 'Every 15 min',  owner: 'Priya Sharma' },
  { id: 13, name: 'Warehouse ETL',       source: 'WMSDB',                     sourceType: 'Database', destination: 'SQL Server',      status: 'SUCCESS', duration: 19, recordsProcessed: 88720,  schedule: 'Hourly',        owner: 'Sarah Kim' },
  { id: 14, name: 'Loyalty ETL',         source: 'Loyalty.csv',               sourceType: 'CSV',      destination: 'SQL Server',      status: 'SUCCESS', duration: 10, recordsProcessed: 31540,  schedule: 'Every 2 hours', owner: 'Michael Chen' },
  { id: 15, name: 'Analytics ETL',       source: 'Events API',                sourceType: 'API',      destination: 'Data Warehouse',  status: 'SUCCESS', duration: 33, recordsProcessed: 214560, schedule: 'Every 15 min',  owner: 'Priya Sharma' },
  { id: 16, name: 'Billing ETL',         source: 'Billing API',               sourceType: 'API',      destination: 'SQL Server',      status: 'FAILED',  duration: 24, recordsProcessed: 0,      schedule: 'Hourly',        owner: 'Sarah Kim' },
  { id: 17, name: 'Support ETL',         source: 'Tickets API',               sourceType: 'API',      destination: 'SQL Server',      status: 'SUCCESS', duration: 13, recordsProcessed: 12310,  schedule: 'Every 2 hours', owner: 'Michael Chen' },
  { id: 18, name: 'Campaign ETL',        source: 'Campaign.csv',              sourceType: 'CSV',      destination: 'Data Warehouse',  status: 'SUCCESS', duration: 16, recordsProcessed: 47890,  schedule: 'Daily 05:30',   owner: 'Alex Morgan' },
  { id: 19, name: 'Fraud ETL',           source: 'TransactionsDB',              sourceType: 'Database', destination: 'SQL Server',      status: 'SUCCESS', duration: 28, recordsProcessed: 156780, schedule: 'Every 30 min',  owner: 'Priya Sharma' },
  { id: 20, name: 'Recommendations ETL', source: 'ML API',                    sourceType: 'API',      destination: 'Data Warehouse',  status: 'SUCCESS', duration: 21, recordsProcessed: 73420,  schedule: 'Every 2 hours', owner: 'Sarah Kim' },
  { id: 21, name: 'Notifications ETL',   source: 'Notification API',          sourceType: 'API',      destination: 'SQL Server',      status: 'SUCCESS', duration: 7,  recordsProcessed: 18960,  schedule: 'Every 15 min',  owner: 'Michael Chen' },
  { id: 22, name: 'Content ETL',         source: 'CMS API',                   sourceType: 'API',      destination: 'Data Warehouse',  status: 'SUCCESS', duration: 12, recordsProcessed: 28470,  schedule: 'Hourly',        owner: 'Alex Morgan' },
  { id: 23, name: 'Geo ETL',             source: 'Geo.csv',                   sourceType: 'CSV',      destination: 'SQL Server',      status: 'SUCCESS', duration: 9,  recordsProcessed: 11280,  schedule: 'Daily 06:30',   owner: 'Michael Chen' },
  { id: 24, name: 'Session ETL',         source: 'Web Logs DB',               sourceType: 'Database', destination: 'Data Warehouse',  status: 'FAILED',  duration: 37, recordsProcessed: 0,      schedule: 'Every 30 min',  owner: 'Priya Sharma' },
];

// Generate deterministic execution history: 8 completed runs per pipeline plus
// the current run for RUNNING pipelines.
function buildHistory() {
  const history = {};
  PIPELINE_DEFS.forEach((def, idx) => {
    const rand = mulberry32(4100 + def.id * 97);
    const runs = [];
    for (let d = 8; d >= 1; d--) {
      const runDate = new Date(TODAY.getTime() - d * 24 * 60 * 60 * 1000);
      runDate.setHours(6 + Math.floor(rand() * 15), Math.floor(rand() * 60), 0, 0);

      let status = 'SUCCESS';
      // Failed pipelines: their most recent historical run failed (and for some,
      // the one before that too). Successful pipelines fail ~6% of older runs.
      if (def.status === 'FAILED') {
        status = d <= 2 ? 'FAILED' : (rand() < 0.06 ? 'FAILED' : 'SUCCESS');
      } else if (rand() < 0.06) {
        status = 'FAILED';
      }

      const duration = Math.max(4, Math.round(def.duration * (0.75 + rand() * 0.5)));
      const records = status === 'FAILED' ? 0 : Math.round(def.recordsProcessed * (0.9 + rand() * 0.2));
      runs.push({
        id: `${def.id}-${d}`,
        pipelineId: def.id,
        timestamp: formatDate(runDate),
        status,
        duration,
        recordsProcessed: records,
      });
    }

    if (def.status === 'RUNNING') {
      const started = new Date(TODAY.getTime() - (10 + idx) * 60 * 1000);
      runs.push({
        id: `${def.id}-0`,
        pipelineId: def.id,
        timestamp: formatDate(started),
        status: 'RUNNING',
        duration: null,
        recordsProcessed: def.recordsProcessed,
      });
    } else if (def.status === 'FAILED') {
      const failedAt = new Date(TODAY.getTime() - (30 + idx * 7) * 60 * 1000);
      runs.push({
        id: `${def.id}-0`,
        pipelineId: def.id,
        timestamp: formatDate(failedAt),
        status: 'FAILED',
        duration: def.duration,
        recordsProcessed: 0,
      });
    } else {
      const lastOk = new Date(TODAY.getTime() - (20 + idx * 11) * 60 * 1000);
      runs.push({
        id: `${def.id}-0`,
        pipelineId: def.id,
        timestamp: formatDate(lastOk),
        status: 'SUCCESS',
        duration: def.duration,
        recordsProcessed: def.recordsProcessed,
      });
    }

    history[def.id] = runs;
  });
  return history;
}

export const PIPELINE_HISTORY = buildHistory();

// Pipeline snapshots derived from defs + latest history entry
export const MOCK_PIPELINES = PIPELINE_DEFS.map((def) => {
  const latest = PIPELINE_HISTORY[def.id][PIPELINE_HISTORY[def.id].length - 1];
  return {
    ...def,
    lastRun: latest.timestamp,
    description: `${def.name} extracts data from ${def.source} and loads it into ${def.destination}.`,
  };
});

// ---------------------------------------------------------------------------
// Error logs
// ---------------------------------------------------------------------------

function stackTrace(component, message) {
  return [
    `Error: ${message}`,
    `    at ${component}.Transform.Execute (ETLServer.DataFlow, Version=2.4.1.0)`,
    `    at ${component}.PipelineStep.ProcessRow (ETLServer.DataFlow, Version=2.4.1.0)`,
    `    at ETLServer.DataFlow.Pipeline.RunPipeline (ETLServer.Core, Version=2.4.1.0)`,
    `    at ETLServer.Scheduler.JobExecutor.RunJob (ETLServer.Scheduler, Version=2.4.1.0)`,
  ].join('\n');
}

const ERROR_DEFS = [
  { id: 1,  pipelineId: 3,  component: 'LKP_Product',    message: "Conversion failed when converting varchar value 'ABC123' to INT.", severity: 'Critical', minutesAgo: 35 },
  { id: 2,  pipelineId: 9,  component: 'SRC_Carrier_API', message: 'Request timed out after 30000ms while calling carrier tracking API endpoint /v2/shipments.', severity: 'High', minutesAgo: 112 },
  { id: 3,  pipelineId: 16, component: 'STG_Billing',     message: "Cannot insert duplicate key row in object 'dbo.Invoices' with unique index 'IX_InvoiceNumber'.", severity: 'Critical', minutesAgo: 136 },
  { id: 4,  pipelineId: 24, component: 'SRC_Web_Logs',    message: "File not found: 'D:\\ingest\\weblogs\\session_20261008.log'. The ingestion file was not delivered by the source system.", severity: 'High', minutesAgo: 182 },
  { id: 5,  pipelineId: 3,  component: 'STG_Product',     message: "The INSERT statement conflicted with the CHECK constraint 'CK_Product_Price'. The conflict occurred in database 'DWH', table 'dbo.Products_Staging'.", severity: 'Medium', minutesAgo: 60 * 12 + 45 },
  { id: 6,  pipelineId: 2,  component: 'LKP_Customer',    message: "Column 'Email' contains 182 NULL values violating the NOT NULL constraint on dbo.Customers.", severity: 'Medium', minutesAgo: 60 * 13 + 20 },
  { id: 7,  pipelineId: 5,  component: 'LKP_Orders',      message: 'Query execution exceeded the memory grant of 2048 MB for the order aggregation step.', severity: 'High', minutesAgo: 60 * 17 + 2 },
  { id: 8,  pipelineId: 1,  component: 'STG_Sales',       message: "Deadlock detected on table 'dbo.Sales_Staging'. The current transaction was chosen as the deadlock victim.", severity: 'Medium', minutesAgo: 60 * 19 + 33 },
  { id: 9,  pipelineId: 7,  component: 'SRC_HR_File',     message: "Permission denied: service account 'svc_etl' lacks READ access on 'HR.csv' in the HR share.", severity: 'High', minutesAgo: 60 * 21 + 49 },
  { id: 10, pipelineId: 12, component: 'LKP_Pricing',     message: "Schema drift detected: column 'discount_rate' changed from DECIMAL(5,2) to VARCHAR(20) in the pricing feed.", severity: 'Critical', minutesAgo: 60 * 23 + 7 },
  { id: 11, pipelineId: 6,  component: 'STG_Marketing',   message: "Invalid date format '2026-13-40' encountered in column 'campaign_start_date'.", severity: 'Medium', minutesAgo: 60 * 25 + 24 },
  { id: 12, pipelineId: 10, component: 'LKP_Returns',     message: 'Foreign key violation: return_reason_id 77 does not exist in dbo.ReturnReasons.', severity: 'Medium', minutesAgo: 60 * 27 + 42 },
  { id: 13, pipelineId: 4,  component: 'SRC_WMS_API',     message: 'API returned HTTP 429 Too Many Requests; the WMS rate limit of 500 calls/min was exceeded.', severity: 'High', minutesAgo: 60 * 29 + 15 },
  { id: 14, pipelineId: 11, component: 'STG_Supplier',    message: 'Data truncation: string or binary data would be truncated in column supplier_name (max 100 chars).', severity: 'Low', minutesAgo: 60 * 30 + 58 },
  { id: 15, pipelineId: 8,  component: 'LKP_Finance',     message: "Currency conversion failed: unknown currency code 'XYZ' in exchange-rate lookup.", severity: 'Low', minutesAgo: 60 * 33 + 31 },
  { id: 16, pipelineId: 15, component: 'SRC_Events_API',  message: 'SSL certificate validation failed for endpoint https://events.api.internal/v3/stream.', severity: 'High', minutesAgo: 60 * 36 + 6 },
  { id: 17, pipelineId: 20, component: 'LKP_Reco',        message: "Model artifact 'reco_v12.pkl' checksum mismatch; expected SHA-256 does not match the deployed artifact.", severity: 'Medium', minutesAgo: 60 * 39 + 29 },
  { id: 18, pipelineId: 14, component: 'STG_Loyalty',     message: 'Batch contained 428 duplicate customer_id values during the loyalty points merge step.', severity: 'Low', minutesAgo: 60 * 43 + 53 },
];

export const MOCK_ERROR_LOGS = ERROR_DEFS.map((e) => {
  const ts = new Date(TODAY.getTime() - e.minutesAgo * 60 * 1000);
  return {
    ...e,
    timestamp: formatDate(ts),
    stackTrace: stackTrace(e.component, e.message),
  };
});

// ---------------------------------------------------------------------------
// Data quality
// ---------------------------------------------------------------------------

function buildQualityTrend() {
  const rand = mulberry32(90210);
  const trend = [];
  for (let d = 9; d >= 0; d--) {
    const date = new Date(TODAY.getTime() - d * 24 * 60 * 60 * 1000);
    trend.push({
      date: formatDayLabel(date),
      completeness: +(94.5 + rand() * 3.4).toFixed(1),
      validity: +(93.2 + rand() * 3.2).toFixed(1),
      uniqueness: +(96.8 + rand() * 2.4).toFixed(1),
    });
  }
  return trend;
}

export const MOCK_DATA_QUALITY = {
  generatedAt: '2026-10-08 10:45',
  summary: {
    totalRecords: 2847312,
    validRecords: 2701904,
    invalidRecords: 91148,
    duplicateRecords: 54260,
  },
  metrics: {
    completeness: 96.4,
    validity: 94.9,
    uniqueness: 98.1,
  },
  trend: buildQualityTrend(),
  problematicColumns: [
    { column: 'Email',       table: 'dbo.Customers',  issue: 'NULL values',       count: 182 },
    { column: 'Phone',       table: 'dbo.Customers',  issue: 'Invalid format',    count: 94 },
    { column: 'CustomerID',  table: 'dbo.Orders',     issue: 'Duplicate values',  count: 428 },
    { column: 'Age',         table: 'dbo.Customers',  issue: 'Out of range',      count: 21 },
    { column: 'OrderDate',   table: 'dbo.Orders',     issue: 'Invalid date',      count: 67 },
    { column: 'Amount',      table: 'dbo.Invoices',   issue: 'Negative values',   count: 33 },
    { column: 'PostalCode',  table: 'dbo.Addresses',  issue: 'Invalid format',    count: 121 },
    { column: 'ProductCode', table: 'dbo.Products',   issue: 'Unknown reference', count: 18 },
  ],
};

// ---------------------------------------------------------------------------
// Dashboard aggregates (derived from pipelines + history)
// ---------------------------------------------------------------------------

export function buildDashboardData(pipelines = MOCK_PIPELINES, history = PIPELINE_HISTORY) {
  const totalPipelines = pipelines.length;
  const statusCounts = { SUCCESS: 0, FAILED: 0, RUNNING: 0 };
  pipelines.forEach((p) => { statusCounts[p.status] += 1; });

  let successfulRuns = 0;
  let failedRuns = 0;
  let totalDuration = 0;
  let completedRuns = 0;
  const daily = {};

  Object.values(history).forEach((runs) => {
    runs.forEach((run) => {
      if (run.status === 'SUCCESS') {
        successfulRuns += 1;
        totalDuration += run.duration;
        completedRuns += 1;
      } else if (run.status === 'FAILED') {
        failedRuns += 1;
        completedRuns += 1;
      }
      const day = run.timestamp.slice(0, 10);
      if (!daily[day]) daily[day] = { success: 0, failed: 0 };
      if (run.status === 'SUCCESS') daily[day].success += 1;
      if (run.status === 'FAILED') daily[day].failed += 1;
    });
  });

  const successRateTrend = Object.keys(daily)
    .sort()
    .slice(-10)
    .map((day) => {
      const d = daily[day];
      const total = d.success + d.failed;
      return {
        date: formatDayLabel(new Date(`${day}T00:00:00`)),
        rate: total ? +((d.success / total) * 100).toFixed(1) : 100,
      };
    });

  const recentRuns = Object.values(history)
    .flat()
    .filter((r) => r.status !== 'RUNNING')
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 8)
    .map((r) => ({
      ...r,
      pipelineName: pipelines.find((p) => p.id === r.pipelineId)?.name || 'Unknown',
    }));

  const failedPipelines = pipelines.filter((p) => p.status === 'FAILED');

  return {
    generatedAt: '2026-10-08 11:00',
    kpis: {
      totalPipelines,
      successfulRuns,
      failedRuns,
      runningPipelines: statusCounts.RUNNING,
      avgDuration: completedRuns ? +(totalDuration / completedRuns).toFixed(1) : 0,
    },
    statusDistribution: [
      { name: 'Success', value: statusCounts.SUCCESS, color: '#16a34a' },
      { name: 'Failed', value: statusCounts.FAILED, color: '#dc2626' },
      { name: 'Running', value: statusCounts.RUNNING, color: '#2563eb' },
    ],
    successRateTrend,
    recentRuns,
    failedPipelines,
  };
}

// ---------------------------------------------------------------------------
// AI error analysis knowledge base (mock model)
// ---------------------------------------------------------------------------

export const AI_KNOWLEDGE_BASE = [
  {
    patterns: [/conversion failed/i, /varchar.*int/i, /int.*varchar/i, /cast/i, /type/i],
    cause: 'A source value contains non-numeric characters that cannot be cast to an integer column. In this case the value "ABC123" violates the target INT type, usually because the upstream feed changed its encoding or sent a placeholder/placeholder code instead of a numeric key.',
    solution: [
      'Add a validation step in the transformation to reject or quarantine rows with non-numeric product codes before the cast.',
      'Map known placeholder codes (e.g. ABC123) to a default product key or route them to an exceptions table for review.',
      'Add a TRY_CAST / TRY_CONVERT in the SQL staging step so bad rows fail gracefully instead of aborting the load.',
      'Ask the source system owner to confirm whether the product code format recently changed.',
    ],
    confidence: 92,
    notes: 'Recommended: quarantine the offending rows rather than failing the entire batch. This pattern often appears after upstream schema or encoding changes.',
  },
  {
    patterns: [/timed out/i, /timeout/i, /429/i, /rate limit/i],
    cause: 'The source API did not respond within the configured window, or the pipeline exceeded the source rate limit. This is typically caused by API throttling, network latency, or an oversized page size in a single request.',
    solution: [
      'Enable retry with exponential backoff (3 attempts, 5s/15s/45s) on the source connector.',
      'Reduce the page size or batch window for the API extraction step.',
      'Check the source API status page and rate-limit headers (Retry-After) before re-running.',
      'If the endpoint is chronically slow, move the extraction to an off-peak schedule window.',
    ],
    confidence: 84,
    notes: 'Timeouts are usually transient. Re-running the pipeline after backoff resolves most cases.',
  },
  {
    patterns: [/duplicate key/i, /duplicate.*value/i, /unique index/i, /primary key/i],
    cause: 'The load attempted to insert rows that violate a unique constraint. Duplicate invoice numbers usually indicate the source replayed a batch, the incremental watermark was reset, or the deduplication step was skipped.',
    solution: [
      'Verify the incremental watermark / high-water mark for the source extract.',
      'Add a deduplication step keyed on the natural key before the insert.',
      'Switch the load to MERGE (upsert) semantics so replays update instead of failing.',
      'Check whether the failed batch was partially loaded and truncate the staging table before retry.',
    ],
    confidence: 90,
    notes: 'Do not drop the unique index - it is protecting data integrity. Fix the upstream replay instead.',
  },
  {
    patterns: [/file not found/i, /not delivered/i, /missing file/i],
    cause: 'The expected ingestion file was not present at pickup time. The upstream system likely failed to deliver the file, wrote it to a different path, or delivered it under a different naming convention.',
    solution: [
      'Confirm with the source system owner that the file was generated and dropped to the correct share/path.',
      'Check for alternate file naming (timestamps, gzip extensions) and update the file matcher if needed.',
      'Add a file-arrival check with a grace period and an alert instead of an immediate pipeline failure.',
      'Re-run the pipeline once the file is confirmed present.',
    ],
    confidence: 88,
    notes: 'Verify the file path and naming convention before retrying; retrying without the file will fail again.',
  },
  {
    patterns: [/null/i, /not null constraint/i],
    cause: 'Mandatory columns contain NULL values in the source extract, violating the target NOT NULL constraint. This typically follows a source schema change or an optional field becoming required downstream.',
    solution: [
      'Profile the source column to quantify NULLs and identify the affected source records.',
      'Add a coalesce/default value for the column in the staging layer, or reject rows with a clear quarantine reason.',
      'Update the source system to populate the mandatory field, or relax the target constraint if the field is genuinely optional.',
    ],
    confidence: 86,
    notes: 'Quarantine-and-load is preferred over failing the batch when the column is not business-critical.',
  },
  {
    patterns: [/permission denied/i, /access denied/i, /lacks read/i, /unauthorized/i, /403/i],
    cause: 'The service account running the pipeline lacks the required permission on the source file or endpoint. This usually happens after an access-review cleanup, a credential rotation, or a folder permission change.',
    solution: [
      'Grant the service account (svc_etl) the minimum required permission (READ) on the resource.',
      'Verify the stored credential has not expired or been rotated.',
      'Re-run the pipeline after confirming access with a manual test read.',
    ],
    confidence: 94,
    notes: 'Follow least-privilege: grant read-only scope on the specific resource, not the whole share.',
  },
  {
    patterns: [/memory grant/i, /out of memory/i, /exceeded.*memory/i],
    cause: 'The transformation step required more memory than granted, usually because the input volume grew sharply, statistics are stale, or a join produced an unexpected row explosion.',
    solution: [
      'Increase the memory grant for the step or enable adaptive memory settings.',
      'Update statistics on the source tables and re-check the estimated row counts.',
      'Partition or batch the aggregation to reduce peak memory usage.',
    ],
    confidence: 78,
    notes: 'Check whether input volume spiked before this failure - a one-off spike may just need a larger grant.',
  },
  {
    patterns: [/deadlock/i],
    cause: 'Two concurrent transactions deadlocked on the same staging table, and this pipeline was chosen as the victim. This is common when multiple ETL jobs write to the same staging tables at overlapping times.',
    solution: [
      'Stagger the schedules of pipelines that share staging tables.',
      'Reduce transaction scope and batch size on the staging write.',
      'Add retry-on-deadlock logic (deadlocks are safe to retry by design).',
    ],
    confidence: 89,
    notes: 'Deadlock victims are safe to retry immediately - no partial state is committed.',
  },
  {
    patterns: [/schema drift/i, /changed from/i, /column.*changed/i],
    cause: 'The source schema changed (column type or structure) without a corresponding update to the pipeline contract. The target expects DECIMAL but the feed now delivers VARCHAR.',
    solution: [
      'Add schema-contract validation at ingestion with a clear drift alert.',
      'Update the pipeline mapping to cast the new VARCHAR column to DECIMAL with validation.',
      'Coordinate the change window with the source system owner before deploying the mapping change.',
    ],
    confidence: 91,
    notes: 'Treat schema drift as a contract-breaking change - it should trigger a review, not just a hotfix.',
  },
  {
    patterns: [/foreign key/i, /does not exist in/i, /unknown reference/i],
    cause: 'The load references a key that does not exist in the parent (lookup) table. The dimension load probably ran late or the key was created directly in the source system without being propagated to the warehouse.',
    solution: [
      'Reload the referenced lookup/dimension table first, then retry the pipeline.',
      'Add a pre-load referential-integrity check that lists orphan keys before the insert.',
      'Route orphan keys to an exceptions queue instead of failing the whole batch.',
    ],
    confidence: 87,
    notes: 'Check load ordering - dimension loads must precede fact loads in the dependency graph.',
  },
  {
    patterns: [/ssl/i, /certificate/i],
    cause: 'TLS certificate validation failed for the source endpoint - the certificate may be expired, self-signed, or the trust store on the ETL server is out of date.',
    solution: [
      'Check the endpoint certificate expiry and chain with a browser or openssl.',
      'Update the trust store on the ETL execution host with the issuing CA.',
      'Coordinate certificate renewal with the source system owner if the cert is expired.',
    ],
    confidence: 82,
    notes: 'Never disable certificate validation in production as a workaround.',
  },
  {
    patterns: [/checksum/i, /artifact/i, /model/i],
    cause: 'The deployed model artifact does not match its expected checksum, which suggests a corrupted download, an incomplete promotion, or a version mismatch between the registry and the runtime.',
    solution: [
      'Re-download the artifact from the model registry and verify the checksum.',
      'Confirm the promoted version in the registry matches the version referenced by the pipeline.',
      'Roll back to the last known-good artifact if the corruption persists.',
    ],
    confidence: 85,
    notes: 'Model artifacts should be promoted immutably - never patch a deployed artifact in place.',
  },
  {
    patterns: [/invalid date/i, /date format/i],
    cause: 'The source contains a malformed date value that cannot be parsed by the target date type. Values like month 13 or day 40 indicate missing source-side validation.',
    solution: [
      'Add date parsing with TRY_PARSE / TRY_CONVERT and quarantine unparseable rows.',
      'Push date validation back to the source system to reject impossible dates at entry.',
      'Add a data-quality rule that alerts when invalid-date counts exceed a threshold.',
    ],
    confidence: 90,
    notes: 'Impossible dates (month 13) are almost always source-system bugs, not pipeline bugs.',
  },
  {
    patterns: [/truncat/i],
    cause: 'An incoming string exceeds the target column length and would be truncated. The source field grew beyond the declared target size.',
    solution: [
      'Widen the target column to accommodate the observed maximum length.',
      'Add a pre-load length check that reports offending rows before the insert.',
      'Confirm with the source owner whether the field definition has officially changed.',
    ],
    confidence: 93,
    notes: 'Silently truncating data is risky - prefer an explicit decision (widen vs. reject).',
  },
  {
    patterns: [/currency/i, /exchange/i],
    cause: 'The exchange-rate lookup does not contain the currency code seen in the transaction data, so conversion cannot proceed.',
    solution: [
      'Add the missing currency code to the exchange-rate reference table.',
      'Add a fallback rule (e.g. flag for manual review) for unknown currency codes.',
      'Verify the exchange-rate feed refreshed successfully before the pipeline run.',
    ],
    confidence: 81,
    notes: 'Unknown currency codes are usually a feed-completeness issue on the rates side.',
  },
  {
    patterns: [/duplicate customer/i, /duplicate.*during.*merge/i, /contained.*duplicate/i],
    cause: 'The source batch itself contains duplicate keys, so the merge step cannot apply a one-to-one upsert. This is a source data-quality issue rather than a pipeline defect.',
    solution: [
      'Add a deduplication step (keep latest by updated timestamp) before the merge.',
      'Report the duplicate keys back to the source system owner.',
      'Track duplicate counts as a data-quality metric with an alerting threshold.',
    ],
    confidence: 86,
    notes: 'Keep-latest deduplication is safe when updated_at is reliable; otherwise quarantine for review.',
  },
];

export const DEFAULT_AI_ANALYSIS = {
  cause: 'The error could not be matched to a known failure pattern with high confidence. Review the full stack trace, the recent deployment history, and any upstream changes (schema, feed format, credentials) around the failure time.',
  solution: [
    'Inspect the full stack trace and identify the failing transformation step.',
    'Check the pipeline run history for recurring failures at the same step.',
    'Review recent changes to source schemas, credentials, and feed formats.',
    'Re-run the pipeline once the likely cause is addressed.',
  ],
  confidence: 45,
  notes: 'This is a generic assessment. Escalate to the pipeline owner if the failure repeats.',
};

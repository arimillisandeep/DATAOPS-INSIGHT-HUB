// ---------------------------------------------------------------------------
// Centralized API service layer
//
// CURRENT PHASE: mock implementation with simulated latency. Every method maps
// 1:1 to a future FastAPI endpoint (see comments). When the backend is ready,
// flip USE_MOCK_API to false (or set VITE_API_URL) and replace each mock body
// with an HTTP call - pages and hooks never change.
// ---------------------------------------------------------------------------

import axios from 'axios';
import {
  MOCK_PIPELINES,
  PIPELINE_HISTORY,
  MOCK_ERROR_LOGS,
  MOCK_USERS,
  MOCK_DATA_QUALITY,
  AI_KNOWLEDGE_BASE,
  DEFAULT_AI_ANALYSIS,
  buildDashboardData,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_MOCK_API = true; // <- set false in Phase 8+ when FastAPI is available

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Mock "database" (mutable in-memory copies)
// ---------------------------------------------------------------------------

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const db = {
  pipelines: deepClone(MOCK_PIPELINES),
  history: deepClone(PIPELINE_HISTORY),
  logs: deepClone(MOCK_ERROR_LOGS),
  users: deepClone(MOCK_USERS),
  dataQuality: deepClone(MOCK_DATA_QUALITY),
};
db.pipelines.forEach((p) => { p._baseRecords = p.recordsProcessed; });

function delay(min = 250, max = 750) {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function formatNow() {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Auth           -> POST /api/auth/login
// ---------------------------------------------------------------------------

export async function login(email, password) {
  if (USE_MOCK_API) {
    await delay();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      throw httpError(401, 'Invalid email or password. Please check your credentials and try again.');
    }
    if (user.status !== 'Active') {
      throw httpError(403, 'This account is inactive. Contact your administrator.');
    }
    const { password: _pw, ...safeUser } = user;
    return { user: safeUser, token: `mock-jwt-${user.id}-${Date.now()}` };
  }
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
}

// ---------------------------------------------------------------------------
// Dashboard      -> GET /api/dashboard
// ---------------------------------------------------------------------------

export async function getDashboard() {
  if (USE_MOCK_API) {
    await delay(350, 900);
    return buildDashboardData(db.pipelines, db.history);
  }
  const res = await apiClient.get('/dashboard');
  return res.data;
}

// ---------------------------------------------------------------------------
// Pipelines      -> GET /api/pipelines, GET /api/pipelines/{id}
// Runs           -> GET /api/pipelines/{id}/runs
// Retry          -> POST /api/pipelines/{id}/retry
// ---------------------------------------------------------------------------

export async function getPipelines({ search = '', status = 'ALL', source = 'ALL', sortBy = 'lastRun', sortOrder = 'desc', page = 1, pageSize = 8 } = {}) {
  if (USE_MOCK_API) {
    await delay();
    let rows = [...db.pipelines];

    if (status !== 'ALL') rows = rows.filter((p) => p.status === status);
    if (source !== 'ALL') rows = rows.filter((p) => p.sourceType === source);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) =>
        [p.name, p.source, p.destination, p.owner, p.schedule].some((f) => f.toLowerCase().includes(q))
      );
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortBy === 'duration') cmp = (a.duration || 0) - (b.duration || 0);
      else cmp = a.lastRun < b.lastRun ? -1 : 1;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    const total = rows.length;
    const start = (page - 1) * pageSize;
    return { data: rows.slice(start, start + pageSize), total, page, pageSize };
  }
  const res = await apiClient.get('/pipelines', { params: { search, status, source, sortBy, sortOrder, page, pageSize } });
  return res.data;
}

export async function getPipeline(id) {
  if (USE_MOCK_API) {
    await delay(200, 500);
    const pipeline = db.pipelines.find((p) => p.id === Number(id));
    if (!pipeline) throw httpError(404, 'Pipeline not found.');
    return deepClone(pipeline);
  }
  const res = await apiClient.get(`/pipelines/${id}`);
  return res.data;
}

export async function getPipelineRuns(id) {
  if (USE_MOCK_API) {
    await delay(200, 500);
    const runs = db.history[Number(id)] || [];
    return deepClone(runs);
  }
  const res = await apiClient.get(`/pipelines/${id}/runs`);
  return res.data;
}

export async function getPipelineErrors(id) {
  if (USE_MOCK_API) {
    await delay(150, 400);
    return deepClone(db.logs.filter((l) => l.pipelineId === Number(id)));
  }
  const res = await apiClient.get(`/logs`, { params: { pipelineId: id } });
  return res.data;
}

export async function retryPipeline(id) {
  if (USE_MOCK_API) {
    await delay(1100, 1800); // simulate a real processing run
    const pipeline = db.pipelines.find((p) => p.id === Number(id));
    if (!pipeline) throw httpError(404, 'Pipeline not found.');
    if (pipeline.status !== 'FAILED') {
      throw httpError(409, `Only failed pipelines can be retried. Current status: ${pipeline.status}.`);
    }

    const duration = 8 + Math.floor(Math.random() * 7);
    const records = Math.round((pipeline._baseRecords || 10000) * (0.9 + Math.random() * 0.2));
    const timestamp = formatNow();

    pipeline.status = 'SUCCESS';
    pipeline.duration = duration;
    pipeline.recordsProcessed = records;
    pipeline.lastRun = timestamp;

    const runs = db.history[Number(id)] || [];
    // replace the failed run marker with a successful re-run
    if (runs.length && runs[runs.length - 1].status === 'FAILED') {
      runs[runs.length - 1] = { id: `${id}-retry`, pipelineId: Number(id), timestamp, status: 'SUCCESS', duration, recordsProcessed: records };
    } else {
      runs.push({ id: `${id}-retry`, pipelineId: Number(id), timestamp, status: 'SUCCESS', duration, recordsProcessed: records });
    }

    return { pipeline: deepClone(pipeline), run: deepClone(runs[runs.length - 1]) };
  }
  const res = await apiClient.post(`/pipelines/${id}/retry`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Error logs     -> GET /api/logs
// AI analysis    -> POST /api/ai/analyze-error
// ---------------------------------------------------------------------------

export async function getLogs({ search = '', severity = 'ALL', page = 1, pageSize = 10 } = {}) {
  if (USE_MOCK_API) {
    await delay();
    let rows = [...db.logs];

    if (severity !== 'ALL') rows = rows.filter((l) => l.severity === severity);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((l) => {
        const pipelineName = db.pipelines.find((p) => p.id === l.pipelineId)?.name || '';
        return [pipelineName, l.component, l.message].some((f) => f.toLowerCase().includes(q));
      });
    }

    rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const data = rows.slice(start, start + pageSize).map((l) => ({
      ...l,
      pipelineName: db.pipelines.find((p) => p.id === l.pipelineId)?.name || 'Unknown',
    }));
    return { data, total, page, pageSize };
  }
  const res = await apiClient.get('/logs', { params: { search, severity, page, pageSize } });
  return res.data;
}

export async function analyzeError(payload) {
  if (USE_MOCK_API) {
    await delay(800, 1600);
    // Simulated failure path so the UI's error/retry state is demonstrable.
    if (Math.random() < 0.15) {
      throw httpError(503, 'AI analysis service is temporarily unavailable. Please retry the analysis.');
    }
    const text = `${payload.message || ''} ${payload.component || ''}`;
    const match = AI_KNOWLEDGE_BASE.find((entry) => entry.patterns.some((re) => re.test(text)));
    const analysis = match || DEFAULT_AI_ANALYSIS;
    return {
      errorId: payload.errorId,
      possibleCause: analysis.cause,
      recommendedSolution: analysis.solution,
      confidence: analysis.confidence,
      notes: analysis.notes,
      analyzedAt: formatNow(),
    };
  }
  const res = await apiClient.post('/ai/analyze-error', payload);
  return res.data;
}

// ---------------------------------------------------------------------------
// Data quality   -> GET /api/data-quality
// ---------------------------------------------------------------------------

export async function getDataQuality() {
  if (USE_MOCK_API) {
    await delay(350, 800);
    return deepClone(db.dataQuality);
  }
  const res = await apiClient.get('/data-quality');
  return res.data;
}

// ---------------------------------------------------------------------------
// Users (Admin)  -> GET/POST /api/users, PUT/DELETE /api/users/{id}
// ---------------------------------------------------------------------------

const VALID_ROLES = ['Admin', 'Data Engineer', 'Viewer'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function getUsers() {
  if (USE_MOCK_API) {
    await delay();
    const users = db.users.map(({ password: _pw, ...safe }) => safe);
    return deepClone(users);
  }
  const res = await apiClient.get('/users');
  return res.data;
}

export async function createUser({ name, email, role, status = 'Active' }) {
  if (USE_MOCK_API) {
    await delay();
    if (!name || !name.trim()) throw httpError(400, 'Name is required.');
    if (!EMAIL_RE.test(email || '')) throw httpError(400, 'A valid email address is required.');
    if (!VALID_ROLES.includes(role)) throw httpError(400, 'Role must be Admin, Data Engineer, or Viewer.');
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw httpError(409, 'A user with this email already exists.');
    }
    const user = {
      id: Math.max(...db.users.map((u) => u.id)) + 1,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      lastLogin: 'Never',
      password: 'Temp@1234', // mock only - real backend issues an invitation
    };
    db.users.push(user);
    const { password: _pw, ...safe } = user;
    return safe;
  }
  const res = await apiClient.post('/users', { name, email, role, status });
  return res.data;
}

export async function updateUser(id, { name, email, role, status }) {
  if (USE_MOCK_API) {
    await delay();
    const user = db.users.find((u) => u.id === Number(id));
    if (!user) throw httpError(404, 'User not found.');
    if (!name || !name.trim()) throw httpError(400, 'Name is required.');
    if (!EMAIL_RE.test(email || '')) throw httpError(400, 'A valid email address is required.');
    if (!VALID_ROLES.includes(role)) throw httpError(400, 'Role must be Admin, Data Engineer, or Viewer.');
    if (db.users.some((u) => u.id !== Number(id) && u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw httpError(409, 'A user with this email already exists.');
    }
    user.name = name.trim();
    user.email = email.trim();
    user.role = role;
    user.status = status;
    const { password: _pw, ...safe } = user;
    return safe;
  }
  const res = await apiClient.put(`/users/${id}`, { name, email, role, status });
  return res.data;
}

export async function deleteUser(id) {
  if (USE_MOCK_API) {
    await delay();
    const idx = db.users.findIndex((u) => u.id === Number(id));
    if (idx === -1) throw httpError(404, 'User not found.');
    if (db.users[idx].email === 'admin@dataops.com') {
      throw httpError(409, 'The primary admin account cannot be deleted.');
    }
    db.users.splice(idx, 1);
    return { success: true };
  }
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
}

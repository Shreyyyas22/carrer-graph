const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const DEFAULT_DEVELOPER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_DEVELOPER_ID || "";

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Unable to reach the API. Is the backend running?");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status, "Received an invalid response from the API.");
  }

  if (!body.success) {
    throw new ApiError(
      body.error?.code ?? response.status,
      body.error?.message ?? "Request failed."
    );
  }

  return body.data;
}

function buildQuery(params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && String(v).trim() !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  // Phase 5-6
  getDeveloper: (id) => request(`/api/developers/${id}`),
  getDeveloperSkills: (id) => request(`/api/developers/${id}/skills`),
  getJobMatches: (devId) => request(`/api/jobs?dev_id=${encodeURIComponent(devId)}`),
  getMissingSkills: (jobId, devId) =>
    request(
      `/api/jobs/${jobId}/missing-skills?dev_id=${encodeURIComponent(devId)}`
    ),
  getSimilarJobs: (jobId) => request(`/api/jobs/${jobId}/similar`),
  getCompanyJobs: (companyId) => request(`/api/companies/${companyId}/jobs`),
  getSkillResources: (skillId) => request(`/api/skills/${skillId}/resources`),
  getRelatedTechJobs: (techId) => request(`/api/skills/${techId}/related-jobs`),
  getCareerPath: (currentRoleId, targetRoleId) =>
    request(
      `/api/career-path?current_role_id=${encodeURIComponent(currentRoleId)}&target_role_id=${encodeURIComponent(targetRoleId)}`
    ),
  getNeighborhood: (nodeId) =>
    request(`/api/neighborhood?node_id=${encodeURIComponent(nodeId)}`),
  searchGraph: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),

  // Phase 7
  getJob: (jobId) => request(`/api/jobs/${encodeURIComponent(jobId)}`),
  listJobs: (params = {}) => request(`/api/jobs${buildQuery(params)}`),
  listCompanies: () => request("/api/companies"),
  getCompany: (companyId) => request(`/api/companies/${encodeURIComponent(companyId)}`),
  listRoles: () => request("/api/roles"),
  listLocations: () => request("/api/locations"),
  listIndustries: () => request("/api/industries"),
  listSkills: () => request("/api/skills"),
};

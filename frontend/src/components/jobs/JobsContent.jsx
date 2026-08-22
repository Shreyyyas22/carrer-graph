"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, MapPin, Briefcase, Building2 } from "lucide-react";
import { api, DEFAULT_DEVELOPER_ID } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { JobsSkeleton } from "@/components/ui/Skeleton";

function matchVariant(percentage) {
  if (percentage >= 75) return "success";
  if (percentage >= 50) return "primary";
  if (percentage >= 25) return "warning";
  return "danger";
}

export default function JobsContent() {
  const [jobs, setJobs] = useState([]);
  const [options, setOptions] = useState({ roles: [], locations: [], industries: [], skills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState(""); // debounced, 2+ chars or empty
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("");
  const [level, setLevel] = useState("");
  const [skill, setSkill] = useState("");
  const [industry, setIndustry] = useState("");

  const hasActiveFilters = useMemo(
    () => Boolean(search || role || location || remote || level || skill || industry || inputValue.trim()),
    [search, role, location, remote, level, skill, industry, inputValue]
  );

  const clearFilters = () => {
    setInputValue("");
    setSearch("");
    setRole("");
    setLocation("");
    setRemote("");
    setLevel("");
    setSkill("");
    setIndustry("");
  };

  const commitSearch = useCallback(() => {
    const v = inputValue.trim();
    if (v.length > 0 && v.length < 2) return; // keep 1-char as draft, don't fetch
    setSearch(v);
  }, [inputValue]);

  // debounce input → search (500ms) but only for 2+ chars or clear
  useEffect(() => {
    const v = inputValue.trim();
    if (v.length > 0 && v.length < 2) return; // wait for 2nd char
    const t = setTimeout(() => setSearch(v), 500);
    return () => clearTimeout(t);
  }, [inputValue]);

  const fetchOptions = useCallback(async () => {
    try {
      const [roles, locations, industries, skills] = await Promise.all([
        api.listRoles(),
        api.listLocations(),
        api.listIndustries(),
        api.listSkills(),
      ]);
      setOptions({
        roles: (Array.isArray(roles) ? roles : []).map((r) => r.role ?? r),
        locations: (Array.isArray(locations) ? locations : []).map((l) => l.location ?? l),
        industries: (Array.isArray(industries) ? industries : []).map((i) => i.industry ?? i),
        skills: (Array.isArray(skills) ? skills : []).map((s) => s.skill ?? s),
      });
    } catch {
      // filter options are best-effort
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const devId = DEFAULT_DEVELOPER_ID;
      if (devId) params.dev_id = devId;
      if (search.trim()) params.search = search.trim();
      if (role) params.role = role;
      if (location) params.location = location;
      if (remote) params.remote = remote;
      if (level) params.level = level;
      if (skill) params.skill = skill;
      if (industry) params.industry = industry;
      const data = await api.listJobs(params);
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [search, role, location, remote, level, skill, industry]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <JobsSkeleton />;
  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={isDbDown ? "Graph database unavailable" : "Could not load jobs"}
        message={isDbDown ? "CognoDB is unreachable — check the backend/DB then retry. Your filters are preserved." : error.message}
        onRetry={load}
      />
    );
  }

  const showMatch = Boolean(DEFAULT_DEVELOPER_ID) && jobs.length > 0 && jobs[0].match_percentage != null;
  const showMinCharsHint = inputValue.trim().length > 0 && inputValue.trim().length < 2;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search: input + Search button, Enter to commit, 2-char minimum */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSearch();
                  if (e.key === "Escape") {
                    setInputValue("");
                    setSearch("");
                  }
                }}
                placeholder="Search title or description… (min 2 chars)"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              {inputValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setInputValue("");
                    setSearch("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={commitSearch}
              className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Search
            </button>
          </div>
          {showMinCharsHint && (
            <p className="text-xs text-amber-600">Type at least 2 characters, then press Enter or Search.</p>
          )}

          {/* Filters row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 xl:col-span-1">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              {options.roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All locations</option>
              {options.locations.map((l) => (
                <option key={l.id} value={l.city}>
                  {l.city}
                </option>
              ))}
            </select>
            <select
              value={remote}
              onChange={(e) => setRemote(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Remote? Any</option>
              <option value="true">Remote only</option>
              <option value="false">On-site only</option>
            </select>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All levels</option>
              {["Junior", "Mid", "Senior", "Lead"].map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All skills</option>
              {options.skills.slice(0, 80).map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All industries</option>
              {options.industries.map((ind) => (
                <option key={ind.id} value={ind.name}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" /> Clear filters
            </button>
          )}
        </div>
      </Card>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting search or filters, or clear them to see all jobs."
          action={
            hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} found{search ? ` for “${search}”` : ""}
          </p>
          <ul className="space-y-3">
            {jobs.map((row) => {
              const job = row.job || {};
              const r = row.role;
              const loc = row.location;
              const comp = row.company;
              return (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {r?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" /> {r.name}
                            </span>
                          )}
                          {loc?.city && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {loc.city}
                            </span>
                          )}
                          {job.level && <Badge variant="default">{job.level}</Badge>}
                          {job.remote ? (
                            <Badge variant="primary">Remote</Badge>
                          ) : (
                            <Badge variant="default">On-site</Badge>
                          )}
                          {comp?.name && (
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" /> {comp.name}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {job.description}
                          </p>
                        )}
                      </div>
                      {showMatch && row.match_percentage != null && (
                        <Badge variant={matchVariant(row.match_percentage)} className="shrink-0 self-start sm:self-center">
                          {row.match_percentage}% match
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

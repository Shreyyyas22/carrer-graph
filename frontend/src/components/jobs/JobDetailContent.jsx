"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Building2, Sparkles, BookOpen, Users } from "lucide-react";
import { api, DEFAULT_DEVELOPER_ID } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { JobDetailSkeleton } from "@/components/ui/Skeleton";

function matchVariant(p) {
  if (p >= 75) return "success";
  if (p >= 50) return "primary";
  if (p >= 25) return "warning";
  return "danger";
}

export default function JobDetailContent({ jobId }) {
  const [detail, setDetail] = useState(null);
  const [match, setMatch] = useState(null);
  const [missing, setMissing] = useState(null);
  const [resourcesBySkill, setResourcesBySkill] = useState({});
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.getJob(jobId);
      setDetail(d);

      // fetch secondary data best-effort in parallel; each guards its own errors
      const jobsWithMatch = DEFAULT_DEVELOPER_ID
        ? api.listJobs({ dev_id: DEFAULT_DEVELOPER_ID }).catch(() => [])
        : Promise.resolve(null);
      const missingP = DEFAULT_DEVELOPER_ID
        ? api.getMissingSkills(jobId, DEFAULT_DEVELOPER_ID).catch(() => [])
        : Promise.resolve(null);
      const similarP = api.getSimilarJobs(jobId).catch(() => []);

      const [jm, ms, sim] = await Promise.all([jobsWithMatch, missingP, similarP]);

      if (Array.isArray(jm)) {
        const row = jm.find((r) => (r.job || {}).id === jobId);
        if (row) setMatch({ matched_reqs: row.matched_reqs, total_reqs: row.total_reqs, match_percentage: row.match_percentage });
      }
      if (Array.isArray(ms)) setMissing(ms);
      if (Array.isArray(sim)) setSimilar(sim);

      // load learning resources per missing skill (learning resources may be empty in current seed)
      if (Array.isArray(ms) && ms.length > 0) {
        const entries = await Promise.all(
          ms.slice(0, 6).map(async (row) => {
            const skill = row.skill || row;
            if (!skill?.id) return [skill?.id, []];
            try {
              const lr = await api.getSkillResources(skill.id);
              return [skill.id, Array.isArray(lr) ? lr : []];
            } catch {
              return [skill.id, []];
            }
          })
        );
        const map = {};
        for (const [sid, list] of entries) map[sid] = list;
        setResourcesBySkill(map);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <JobDetailSkeleton />;
  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={error.code === 404 ? "Job not found" : isDbDown ? "Graph database unavailable" : "Could not load job"}
        message={isDbDown ? "CognoDB is unreachable. Check the backend and database, then retry." : error.message}
        onRetry={load}
      />
    );
  }
  if (!detail?.job)
    return <EmptyState title="No job data" description="This job could not be found." />;

  const job = detail.job;
  const role = detail.role;
  const location = detail.location;
  const company = detail.company;
  const requiredSkills = detail.required_skills || [];
  const technologies = detail.technologies || [];

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <Card className="border-indigo-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {role?.name && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {role.name}
                </span>
              )}
              {location?.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {location.city}
                </span>
              )}
              {job.level && <Badge variant="default">{job.level}</Badge>}
              {job.remote ? <Badge variant="primary">Remote</Badge> : <Badge variant="default">On-site</Badge>}
              {company?.name && (
                <Link
                  href={company.id ? `/companies/${company.id}` : "#"}
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <Building2 className="h-4 w-4" /> {company.name}
                </Link>
              )}
            </div>
            {job.description && <p className="mt-3 max-w-3xl text-sm text-gray-600">{job.description}</p>}
          </div>
          {match?.match_percentage != null && (
            <Badge variant={matchVariant(match.match_percentage)} className="shrink-0 self-start px-3 py-1 text-sm">
              {match.match_percentage}% match · {match.matched_reqs}/{match.total_reqs} skills
            </Badge>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Required skills</CardTitle>
            <CardDescription>From REQUIRES relationships; importance shown when present.</CardDescription>
          </CardHeader>
          {requiredSkills.length === 0 ? (
            <EmptyState title="No required skills listed" description="This job has no REQUIRES relationships." />
          ) : (
            <ul className="space-y-2">
              {requiredSkills.map((entry, idx) => {
                const s = entry.skill || entry;
                const imp = entry.importance;
                const isMissing =
                  Array.isArray(missing) && missing.some((m) => (m.skill || m)?.id === s.id);
                return (
                  <li
                    key={s?.id ?? idx}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${isMissing ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"}`}
                  >
                    <span className="font-medium text-gray-900">{s?.name ?? "Unknown skill"}</span>
                    <span className="flex items-center gap-2">
                      {s?.category && <span className="text-xs text-gray-500">{s.category}</span>}
                      {imp && <Badge variant="default">{imp}</Badge>}
                      {isMissing && <Badge variant="warning">Missing</Badge>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies used</CardTitle>
            <CardDescription>From USES relationships.</CardDescription>
          </CardHeader>
          {technologies.length === 0 ? (
            <EmptyState title="No technologies listed" description="No USES relationships on this job." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {technologies.map((t) => (
                <Badge key={t.id} variant="primary">
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Skill gap */}
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Skill gap
          </CardTitle>
          <CardDescription>
            Missing skills for the configured developer ({DEFAULT_DEVELOPER_ID ? "set" : "no developer configured — set NEXT_PUBLIC_DEFAULT_DEVELOPER_ID"}).
          </CardDescription>
        </CardHeader>
        {!DEFAULT_DEVELOPER_ID ? (
          <EmptyState
            title="No developer configured"
            description="Set NEXT_PUBLIC_DEFAULT_DEVELOPER_ID in frontend/.env.local and restart the dev server to see your missing skills and learning resources."
            action={
              <a href="/profile" className="text-sm font-medium text-indigo-600 hover:underline">Go to profile →</a>
            }
          />
        ) : missing == null ? (
          <div className="space-y-2 py-6" aria-busy>
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        ) : missing.length === 0 ? (
          <EmptyState title="No skill gap ✨" description="You already have all required skills for this job." />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {missing.length} missing skill{missing.length > 1 ? "s" : ""}:
            </p>
            <ul className="space-y-3">
              {missing.map((row) => {
                const skill = row.skill || row;
                const lrs = resourcesBySkill[skill.id] || [];
                return (
                  <li key={skill.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      {skill.category && <Badge variant="default">{skill.category}</Badge>}
                    </div>
                    <div className="mt-3">
                      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <BookOpen className="h-3.5 w-3.5" /> Learning resources
                      </p>
                      {lrs.length === 0 ? (
                        <p className="mt-1 text-sm text-gray-500">No learning resources in the graph for this skill yet (seed data has none).</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {lrs.map((r) => {
                            const resource = r.resource || r;
                            return (
                              <li key={resource.id || resource.url} className="text-sm">
                                {resource.url ? (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:underline"
                                  >
                                    {resource.title || resource.url}
                                  </a>
                                ) : (
                                  <span className="text-gray-700">{resource.title || resource.name || "Resource"}</span>
                                )}
                                {resource.type && <span className="ml-2 text-xs text-gray-500">· {resource.type}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" /> Similar jobs
          </CardTitle>
          <CardDescription>Jobs sharing ≥3 skills or the same role.</CardDescription>
        </CardHeader>
        {similar.length === 0 ? (
          <EmptyState title="No similar jobs" description="No other jobs share enough skills or role with this one." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {similar.slice(0, 10).map((row) => {
              const j = row.job || row;
              return (
                <li key={j.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/jobs/${j.id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                      {j.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {row.shared_skills != null ? `${row.shared_skills} shared skills` : ""}
                      {row.shared_skills != null && row.shared_roles ? " · " : ""}
                      {row.shared_roles ? "same role" : ""}
                      {j.level ? ` · ${j.level}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${j.id}`}
                    className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

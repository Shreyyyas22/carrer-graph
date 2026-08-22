"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Globe, Briefcase, MapPin, Layers } from "lucide-react";
import { api } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { CompanyDetailSkeleton } from "@/components/ui/Skeleton";

export default function CompanyDetailContent({ companyId }) {
  const [company, setCompany] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [technologies, setTechnologies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, jobsData] = await Promise.all([
        api.getCompany(companyId).catch((e) => {
          throw e;
        }),
        api.getCompanyJobs(companyId).catch(() => []),
      ]);
      setCompany(detail.company ?? detail);
      setIndustry(detail.industry ?? null);
      setTechnologies(Array.isArray(detail.technologies) ? detail.technologies : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <CompanyDetailSkeleton />;
  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={error.code === 404 ? "Company not found" : isDbDown ? "Graph database unavailable" : "Could not load company"}
        message={isDbDown ? "CognoDB is unreachable. Check the backend and retry." : error.message}
        onRetry={load}
      />
    );
  }
  if (!company)
    return <EmptyState title="No company" description="Company not found." />;

  const normalizedTechs = technologies.map((r) => r.technology ?? r).filter(Boolean);

  return (
    <div className="space-y-6">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <Card className="border-indigo-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {industry?.name && <Badge variant="primary">{industry.name}</Badge>}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <Globe className="h-4 w-4" /> {company.website}
                  </a>
                )}
              </div>
            </div>
          </div>
          <Badge variant="default" className="self-start">
            {jobs.length} open job{jobs.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" /> Technologies used
          </CardTitle>
          <CardDescription>Aggregated via Job -[:USES]-&gt; Technology across this company&apos;s posted jobs.</CardDescription>
        </CardHeader>
        {normalizedTechs.length === 0 ? (
          <EmptyState title="No technologies" description="No USES relationships found for this company's jobs." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {normalizedTechs.map((t) => (
              <Badge key={t.id} variant="primary">
                {t.name}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-600" /> Open jobs
          </CardTitle>
          <CardDescription>Via Company -[:POSTED]-&gt; Job.</CardDescription>
        </CardHeader>
        {jobs.length === 0 ? (
          <EmptyState title="No open jobs" description="This company has no POSTED relationships yet." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {jobs.map((row) => {
              const j = row.job ?? row;
              const role = row.role;
              const loc = row.location;
              return (
                <li key={j.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/jobs/${j.id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                      {j.title}
                    </Link>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      {role?.name && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> {role.name}
                        </span>
                      )}
                      {loc?.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {loc.city}
                        </span>
                      )}
                      {j.level && <span>· {j.level}</span>}
                      {j.remote ? " · Remote" : ""}
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

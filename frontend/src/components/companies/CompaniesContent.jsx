"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { api } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { CompaniesSkeleton } from "@/components/ui/Skeleton";

export default function CompaniesContent() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listCompanies();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <CompaniesSkeleton />;
  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={isDbDown ? "Graph database unavailable" : "Could not load companies"}
        message={isDbDown ? "CognoDB is unreachable — check the DB and retry." : error.message}
        onRetry={load}
      />
    );
  }
  if (rows.length === 0)
    return <EmptyState title="No companies" description="No Company nodes in the graph." />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => {
        const c = row.company || {};
        const ind = row.industry;
        return (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <Badge variant="default">{row.job_count ?? 0} jobs</Badge>
            </div>
            <h3 className="mt-3 truncate text-base font-semibold text-gray-900">{c.name}</h3>
            {ind?.name && <p className="text-xs text-gray-500">{ind.name}</p>}
            {c.website && <p className="mt-1 truncate text-xs text-indigo-600">{c.website}</p>}
          </Link>
        );
      })}
    </div>
  );
}

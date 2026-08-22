"use client";

import { useCallback, useEffect, useState } from "react";
import { Route, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { CareerPathSkeleton } from "@/components/ui/Skeleton";

export default function CareerPathContent() {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  const [currentRoleId, setCurrentRoleId] = useState("");
  const [targetRoleId, setTargetRoleId] = useState("");
  const [result, setResult] = useState(null); // null=not searched yet, []=empty
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const data = await api.listRoles();
      const list = (Array.isArray(data) ? data : []).map((r) => r.role ?? r);
      setRoles(list);
      if (list.length >= 2) {
        setCurrentRoleId((prev) => prev || list[0].id);
        setTargetRoleId((prev) => prev || list[1].id);
      }
    } catch (e) {
      setRolesError(e);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const search = async () => {
    if (!currentRoleId || !targetRoleId) return;
    setSearching(true);
    setSearchError(null);
    setResult(null);
    try {
      const data = await api.getCareerPath(currentRoleId, targetRoleId);
      setResult(Array.isArray(data) ? data : []);
    } catch (e) {
      setSearchError(e);
    } finally {
      setSearching(false);
    }
  };

  if (rolesLoading) return <CareerPathSkeleton />;
  if (rolesError) {
    const isDbDown = rolesError.code === 0 || rolesError.code === 503;
    return (
      <ErrorState
        title={isDbDown ? "Graph database unavailable" : "Could not load roles"}
        message={isDbDown ? "CognoDB is unreachable — retry after the database is back." : rolesError.message}
        onRetry={loadRoles}
      />
    );
  }
  if (roles.length === 0)
    return <EmptyState title="No roles in graph" description="No Role nodes found." />;

  const currentRole = roles.find((r) => r.id === currentRoleId);
  const targetRole = roles.find((r) => r.id === targetRoleId);
  const sameRole = currentRoleId && targetRoleId && currentRoleId === targetRoleId;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Route className="h-5 w-5 text-indigo-600" /> Find a path
          </CardTitle>
          <CardDescription>Powered by WORKED_AS relationships in the graph. No developers ? try another pair.</CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Current role</label>
            <select
              value={currentRoleId}
              onChange={(e) => setCurrentRoleId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Target role</label>
            <select
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sameRole && (
          <p className="mt-3 text-sm text-amber-600">Pick two different roles to search for a transition.</p>
        )}

        <button
          onClick={search}
          disabled={sameRole || !currentRoleId || !targetRoleId || searching}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" />
          {searching ? "Searching…" : "Find path"}
        </button>

        {currentRole && targetRole && (
          <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{currentRole.name}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{targetRole.name}</span>
          </p>
        )}
      </Card>

      {/* Result */}
      {searching ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6" aria-busy>
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
      ) : searchError ? (
        <ErrorState title="Could not load career path" message={searchError.message} onRetry={search} />
      ) : result == null ? (
        <EmptyState
          title="No search yet"
          description="Choose a pair of roles and hit Find path."
        />
      ) : result.length === 0 ? (
        <EmptyState
          title="No path found"
          description={`No developer in the current seed has WORKED_AS both "${currentRole?.name ?? ""}" and "${targetRole?.name ?? ""}". Seed more WORKED_AS data or try another role pair.`}
          action={
            <button
              onClick={() => {
                setCurrentRoleId(roles[0]?.id ?? "");
                setTargetRoleId(roles[1]?.id ?? "");
                setResult(null);
              }}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Try another pair
            </button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Developers who made this transition</CardTitle>
            <CardDescription>{result.length} developer{result.length > 1 ? "s" : ""} found via graph traversal.</CardDescription>
          </CardHeader>
          <ul className="divide-y divide-gray-100">
            {result.map((row) => {
              const dev = row.developer ?? row;
              return (
                <li key={dev.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{dev.name}</p>
                    <p className="text-xs text-gray-500">{dev.email ?? ""}{dev.experience_years != null ? ` · ${dev.experience_years} yrs` : ""}</p>
                  </div>
                  {dev.bio && <p className="hidden max-w-xs text-sm text-gray-600 sm:block">{dev.bio}</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

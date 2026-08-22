"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, MapPin, Mail, User as UserIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { ProfileSkeleton } from "@/components/ui/Skeleton";

export default function ProfileContent({ developerId }) {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!developerId) {
      setLoading(false);
      setError(new ApiError(400, "Set NEXT_PUBLIC_DEFAULT_DEVELOPER_ID in frontend/.env.local"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        api.getDeveloper(developerId),
        api.getDeveloperSkills(developerId),
      ]);
      setProfile(p);
      setSkills(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ProfileSkeleton />;
  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={error.code === 404 ? "Developer not found" : isDbDown ? "Graph database unavailable" : "Could not load profile"}
        message={isDbDown ? "CognoDB is unreachable — check the backend and database, then retry." : error.message}
        onRetry={load}
      />
    );
  }
  if (!profile)
    return (
      <EmptyState
        title="No profile"
        description="No developer found for the configured ID."
      />
    );

  const dev = profile.developer || {};
  const role = profile.role;
  const location = profile.location;

  return (
    <div className="space-y-6">
      <Card className="border-indigo-100">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{dev.name}</h2>
                {dev.email && (
                  <a
                    href={`mailto:${dev.email}`}
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" /> {dev.email}
                  </a>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {role?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-sm">
                  <Briefcase className="h-4 w-4" /> {role.name}
                </span>
              )}
              {location?.city && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-sm">
                  <MapPin className="h-4 w-4" /> {location.city}
                  {location.country ? `, ${location.country}` : ""}
                </span>
              )}
              {dev.experience_years != null && (
                <span className="rounded-full bg-gray-50 px-3 py-1 text-sm">
                  {dev.experience_years} yrs experience
                </span>
              )}
            </div>
            {dev.bio && <p className="mt-4 max-w-2xl text-sm text-gray-600">{dev.bio}</p>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Proficiency and years from HAS_SKILL relationships.</CardDescription>
        </CardHeader>
        {skills.length === 0 ? (
          <EmptyState
            title="No skills"
            description="This developer has no HAS_SKILL relationships yet."
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.category ?? "Skill"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.proficiency && <Badge variant="primary">{s.proficiency}</Badge>}
                  {s.years != null && (
                    <span className="text-sm text-gray-600">{s.years} yrs</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

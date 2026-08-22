"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, MapPin, Sparkles, Target } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import Card, { CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

function matchVariant(percentage) {
  if (percentage >= 75) return "success";
  if (percentage >= 50) return "primary";
  if (percentage >= 25) return "warning";
  return "danger";
}

export default function DashboardContent({ developerId }) {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (!developerId) {
      setLoading(false);
      setError(new ApiError(400, "Set NEXT_PUBLIC_DEFAULT_DEVELOPER_ID in frontend/.env.local"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileData, skillsData, jobsData] = await Promise.all([
        api.getDeveloper(developerId),
        api.getDeveloperSkills(developerId),
        api.getJobMatches(developerId),
      ]);

      setProfile(profileData);
      setSkills(skillsData);
      setJobs(jobsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    const isDbDown = error.code === 0 || error.code === 503;
    return (
      <ErrorState
        title={
          error.code === 404
            ? "Developer not found"
            : isDbDown
              ? "Graph database unavailable"
              : "Could not load dashboard"
        }
        message={
          isDbDown
            ? "The graph database (CognoDB) is unreachable. If you're running locally, check that Neo4j/CognoDB is up, then retry."
            : error.message
        }
        onRetry={loadDashboard}
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="No profile data"
        description="We couldn't find a developer profile to display."
        action={
          <button
            onClick={loadDashboard}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Retry
          </button>
        }
      />
    );
  }

  const topJobs = jobs.slice(0, 5);
  const topMatch = jobs[0]?.match_percentage ?? 0;
  const developer = profile.developer;
  const role = profile.role?.name;
  const location = profile.location?.city;

  return (
    <div className="space-y-8">
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Welcome back</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">{developer.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {role && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {role}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
              {developer.experience_years != null && (
                <span>{developer.experience_years} yrs experience</span>
              )}
            </div>
          </div>
          {developer.bio && (
            <p className="max-w-md text-sm text-gray-600">{developer.bio}</p>
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Skills tracked</p>
              <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Best job match</p>
              <p className="text-2xl font-bold text-gray-900">{topMatch}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Briefcase className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jobs analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your skills</CardTitle>
            <CardDescription>Proficiency from your graph profile</CardDescription>
          </CardHeader>
          {skills.length === 0 ? (
            <EmptyState
              title="No skills yet"
              description="Add skills to your profile to improve job matching."
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="primary">
                  {skill.name}
                  {skill.proficiency ? ` · ${skill.proficiency}` : ""}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top job matches</CardTitle>
            <CardDescription>Ranked by skill overlap from the graph</CardDescription>
          </CardHeader>
          {topJobs.length === 0 ? (
            <EmptyState
              title="No job matches"
              description="No jobs in the database match your current skill profile."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {topJobs.map(({ job, match_percentage, matched_reqs, total_reqs }) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{job.title}</p>
                    <p className="text-xs text-gray-500">
                      {matched_reqs}/{total_reqs} required skills matched
                      {job.level ? ` · ${job.level}` : ""}
                      {job.remote ? " · Remote" : ""}
                    </p>
                  </div>
                  <Badge variant={matchVariant(match_percentage)}>
                    {match_percentage}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

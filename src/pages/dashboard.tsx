import { useEffect, useState, useRef } from "react";
import Layout from "~/layouts/Layout";
import ActivityLog from "~/components/ActivityLog";
import ProjectStatus from "~/components/ProjectStatus";
import MetricsCard from "~/components/MetricsCard";
import { fetchDashboardData } from "~/lib/api";
import type { User } from "~/pages/api/users";
import type { Project } from "~/pages/api/projects";
import type { Activity } from "~/pages/api/activities";

type DashboardData = {
  users: User[];
  projects: Project[];
  recentActivity: Activity[];
  metrics: {
    activeUsers: number;
    completedProjects: number;
    pendingTasks: number;
    upcomingEvents: number;
  };
  projectsTotalPages?: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const isMounted = useRef(true);

  // Fetch dashboard data (metrics, activities, etc.) once on mount
  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await fetchDashboardData();
        if (!isMounted.current) return;
        setData(dashboardData as DashboardData);
        setActivities(
          Array.isArray((dashboardData as DashboardData)?.recentActivity)
            ? (dashboardData as DashboardData).recentActivity
            : [],
        );
      } catch (error: any) {
        if (!isMounted.current) return;
        if (error?.name === "AbortError") return;
        setError("Failed to load dashboard data.");
        setData(null);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []); // Only run once on mount

  // Fetch paginated projects when currentPage changes
  useEffect(() => {
    let ignore = false;
    async function fetchProjectsPage() {
      setProjectsLoading(true);
      try {
        // If fetchDashboardData does not support pagination, manually paginate here
        const dashboardData = (await fetchDashboardData()) as DashboardData;
        if (ignore || !isMounted.current) return;
        // Manual pagination fallback
        const pageSize = 10; // Adjust as needed or make configurable
        const allProjects = dashboardData.projects || [];
        const pagedProjects = allProjects.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        );
        setData(
          (prev) =>
            ({
              ...prev,
              ...dashboardData,
              projects: pagedProjects,
            }) as DashboardData,
        );
        setTotalPages(Math.max(1, Math.ceil(allProjects.length / pageSize)));
      } catch (e) {
        // Optionally handle error
      } finally {
        if (!ignore && isMounted.current) setProjectsLoading(false);
      }
    }
    fetchProjectsPage();
    return () => {
      ignore = true;
    };
  }, [currentPage]);

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!data || !data.metrics) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
          <p>Failed to load dashboard data.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Active Users"
            value={data.metrics.activeUsers ?? 0}
            trend="+12%"
            trendDirection="up"
          />
          <MetricsCard
            title="Completed Projects"
            value={data.metrics.completedProjects ?? 0}
            trend="+5%"
            trendDirection="up"
          />
          <MetricsCard
            title="Pending Tasks"
            value={data.metrics.pendingTasks ?? 0}
            trend="-3%"
            trendDirection="down"
          />
          <MetricsCard
            title="Upcoming Events"
            value={data.metrics.upcomingEvents ?? 0}
            trend="+2"
            trendDirection="up"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <ProjectStatus projects={data.projects ?? []} />
            <div className="mt-4 flex items-center justify-between">
              <button
                className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || projectsLoading}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || projectsLoading}
              >
                Next
              </button>
            </div>
            {projectsLoading && (
              <div className="mt-2 text-sm text-gray-500">
                Loading projects...
              </div>
            )}
          </div>
          <ActivityLog activities={activities} setActivities={setActivities} />
        </div>
      </div>
    </Layout>
  );
}

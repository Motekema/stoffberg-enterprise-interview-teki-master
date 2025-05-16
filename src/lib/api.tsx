import type { Activity } from "~/pages/api/activities";
import type { Event } from "~/pages/api/events";
import type { Metrics } from "~/pages/api/metrics";
import type { Project } from "~/pages/api/projects";
import type { User } from "~/pages/api/users";

export async function fetchDashboardData() {
  try {
    const usersResponse = await fetch("/api/users").then(
      async (res) => await res.json() as User[],
    );
    const projectsResponse = await fetch("/api/projects").then(
      async (res) => await res.json() as Project[],
    );
    const activitiesResponse = await fetch("/api/activities").then(
      async (res) =>
        await res.json() as {
          activities: Activity[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        },
    );
    const metricsResponse = await fetch("/api/metrics").then(
      async (res) => await res.json() as Metrics,
    );
    const eventsResponse = await fetch("/api/events").then(
      async (res) => await res.json() as { upcoming: Event[] },
    );

    const mergedData = {
      users: usersResponse,
      projects: projectsResponse,
      recentActivity: activitiesResponse.activities.slice(0, 5),
      metrics: {
        activeUsers: metricsResponse.users.active,
        completedProjects: metricsResponse.projects.completed,
        pendingTasks: Array.isArray(projectsResponse)
          ? projectsResponse.reduce(
              (acc: number, project: Project) => acc + project.pendingTasks,
              0,
            )
          : 0,
        upcomingEvents: Array.isArray(eventsResponse.upcoming)
          ? eventsResponse.upcoming.filter(
              (event: Event) => new Date(event.date) > new Date(),
            ).length
          : 0,
      },
    };

    return mergedData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export async function fetchUserData(userId: string) {
  const userResponse = await fetch(`/api/users/${userId}`);
  const userData = (await userResponse.json()) as User;

  const projectsResponse = await fetch(`/api/users/${userId}/projects`);
  const projectsData = (await projectsResponse.json()) as Project[];

  return {
    ...userData,
    projects: projectsData,
  };
}

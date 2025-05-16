import type { Activity } from "~/pages/api/activities";

type ActivityLogProps = {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
};

export default function ActivityLog({
  activities,
  setActivities,
}: ActivityLogProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
      {activities.length === 0 ? (
        <p>No activities found.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="border-b pb-2">
              <p className="text-sm">
                <span className="font-medium">{activity.action}</span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

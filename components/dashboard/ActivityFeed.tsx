import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, CheckCircle2, AlertCircle, FileText, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "message" | "status_change" | "document" | "deadline";
  content: string;
  date: string;
  project: string;
  user?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "status_change":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "document":
        return <FileText size={16} className="text-amber-500" />;
      case "deadline":
        return <Clock size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Activités récentes</h3>
      </div>
      <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <li className="p-4 text-center text-gray-500 text-sm">Aucune activité récente</li>
        ) : (
          activities.map((activity) => (
            <li key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {activity.project}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    {activity.content}
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="text-xs text-gray-500">
                      {activity.user && `${activity.user} · `}
                      {formatDistance(new Date(activity.date), new Date(), { 
                        addSuffix: true,
                        locale: fr
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
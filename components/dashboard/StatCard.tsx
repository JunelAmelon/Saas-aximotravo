import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center ${trend.isPositive ? 'text-[#f21515]' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-500">ce mois</span>
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div className="p-3 bg-[#f21515]/5 rounded-full text-[#f21515]">
          {icon}
        </div>
      </div>
    </div>
  );
}
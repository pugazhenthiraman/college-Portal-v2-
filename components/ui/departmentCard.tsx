// components/ui/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  title: string;
  count: number | string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  bgColor,
  textColor,
  borderColor,
}) => {
  return (
    <div className={`${bgColor} ${textColor} p-6 rounded-lg shadow-md text-center border ${borderColor}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
};

export default DashboardCard;

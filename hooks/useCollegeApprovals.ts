import { useState, useEffect } from "react";
import {
  getPendingColleges,
  getApprovedColleges,
  approveCollege,
  rejectCollege,
  College,
} from "../lib/data";

export function useCollegeApprovals() {
  const [data, setData] = useState<{ pendingColleges: College[]; approvedColleges: College[] }>({
    pendingColleges: [],
    approvedColleges: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const pendingColleges = getPendingColleges() || []; // Ensure it's an array
      const approvedColleges = getApprovedColleges() || []; // Ensure it's an array

      setData({
        pendingColleges,
        approvedColleges,
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleApproval = (id: string, approve: boolean) => {
    if (approve) {
      approveCollege(id);
    } else {
      rejectCollege(id);
    }

    setData({
      pendingColleges: getPendingColleges() || [],
      approvedColleges: getApprovedColleges() || [],
    });
  };

  return { data, loading, handleApproval };
}
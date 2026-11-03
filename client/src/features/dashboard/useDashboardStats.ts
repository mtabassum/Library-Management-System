import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";

export interface DashboardStats {
  totalBooks: number;
  availableCopies: number;
  borrowedCopies: number;
  memberCount: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    apiGet<DashboardStats>("/dashboard")
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { stats, loading, error };
}

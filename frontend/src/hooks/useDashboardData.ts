import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';

export function useDashboardData() {
  const { selectedUserId } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchData() {
      if (!selectedUserId) return;
      
      setLoading(true);
      setError(null);
      try {
        const [today, prediction, explanation, patterns, timeline] = await Promise.all([
          api.getTodayHealth(selectedUserId),
          api.getPrediction(selectedUserId),
          api.getPredictionExplanation(selectedUserId),
          api.getPatterns(selectedUserId),
          api.getTimeline(selectedUserId)
        ]);
        
        if (mounted) {
          setData({
            today,
            prediction,
            explanation,
            patterns,
            timeline: timeline.timeline
          });
        }
      } catch (err) {
        if (mounted) {
          console.error(err);
          setError("Failed to load dashboard data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [selectedUserId]);

  return { data, loading, error };
}

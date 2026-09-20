import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';

export default function Timeline() {
  const { selectedUserId } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [metric, setMetric] = useState('sleep_hours');
  const [range, setRange] = useState('30');

  useEffect(() => {
    async function fetchData() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const [timelineRes, baselineRes] = await Promise.all([
          api.getTimeline(selectedUserId),
          api.getBaseline(selectedUserId)
        ]);
        setData({
          timeline: timelineRes.timeline,
          baseline: baselineRes.personal
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedUserId]);

  const chartData = useMemo(() => {
    if (!data) return [];
    let slice = data.timeline;
    if (range !== 'all') {
      const days = parseInt(range, 10);
      slice = slice.slice(-days);
    }
    return slice.map((d: any) => ({
      ...d,
      dateFormatted: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data, range]);

  if (loading || !data) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-xl" />;
  }

  const baselineValue = data.baseline[metric];

  const formatYAxis = (val: number) => {
    if (metric === 'activity_steps') return `${(val/1000).toFixed(0)}k`;
    return val.toFixed(1);
  };

  const getMetricName = (m: string) => {
    const names: Record<string, string> = {
      sleep_hours: 'Sleep (hours)',
      hydration_liters: 'Hydration (L)',
      stress: 'Stress (0-10)',
      activity_steps: 'Activity (steps)',
      caffeine: 'Caffeine (servings)',
    };
    return names[m] || m;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-900 border border-slate-800 text-sm text-slate-300 rounded-md px-3 py-1.5 outline-none focus:border-slate-600"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            <option value="sleep_hours">Sleep</option>
            <option value="hydration_liters">Hydration</option>
            <option value="stress">Stress</option>
            <option value="activity_steps">Activity</option>
            <option value="caffeine">Caffeine</option>
          </select>
          
          <select 
            className="bg-slate-900 border border-slate-800 text-sm text-slate-300 rounded-md px-3 py-1.5 outline-none focus:border-slate-600"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All history</option>
          </select>
        </div>
      </div>

      <Card className="h-[500px]">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-slate-200">{getMetricName(metric)}</h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-3 h-0.5 bg-blue-500 rounded-full"></div>
                Recorded Value
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-3 h-0 bg-transparent border-t border-dashed border-slate-500"></div>
                Your baseline ({baselineValue.toFixed(1)})
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              {metric === 'activity_steps' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dateFormatted" stroke="#475569" fontSize={12} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={formatYAxis} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  {baselineValue && <ReferenceLine y={baselineValue} stroke="#64748b" strokeDasharray="3 3" />}
                  <Area type="monotone" dataKey={metric} stroke="#3b82f6" fillOpacity={1} fill="url(#colorMetric)" />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="dateFormatted" stroke="#475569" fontSize={12} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={formatYAxis} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  {baselineValue && <ReferenceLine y={baselineValue} stroke="#64748b" strokeDasharray="3 3" />}
                  <Line type="monotone" dataKey={metric} stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

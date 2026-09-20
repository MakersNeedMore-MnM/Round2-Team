import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/Card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

function LogRow({ day }: { day: any }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card className="mb-2 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <div 
        className="px-4 py-3 flex items-center cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 text-slate-500">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <div className="w-24 font-medium text-slate-300">{dateStr}</div>
        
        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-slate-400">
          <div className="hidden md:block">Sleep <span className="text-slate-200">{day.sleep_hours.toFixed(1)} h</span></div>
          <div className="hidden md:block">Hydration <span className="text-slate-200">{day.hydration_liters.toFixed(1)} L</span></div>
          <div className="hidden md:block">Stress <span className="text-slate-200">{day.stress.toFixed(1)}</span></div>
          <div className="hidden md:block">Activity <span className="text-slate-200">{day.activity_steps}</span></div>
          <div className={cn("font-medium", day.headache ? "text-amber-400" : "text-slate-600")}>
            {day.headache ? 'Headache' : 'No Headache'}
          </div>
        </div>
      </div>
      
      {expanded && (
        <CardContent className="px-12 py-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-500 mb-1">Sleep</div>
              <div className="text-lg text-slate-200">{day.sleep_hours.toFixed(1)} hours</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Hydration</div>
              <div className="text-lg text-slate-200">{day.hydration_liters.toFixed(1)} L</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Activity</div>
              <div className="text-lg text-slate-200">{day.activity_steps} steps</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Stress</div>
              <div className="text-lg text-slate-200">{day.stress.toFixed(1)} / 10</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Caffeine</div>
              <div className="text-lg text-slate-200">{day.caffeine} servings</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Headache</div>
              <div className={cn("text-lg", day.headache ? "text-amber-400" : "text-slate-400")}>
                {day.headache ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function DailyLogs() {
  const { selectedUserId } = useUser();
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('30');
  const [headacheOnly, setHeadacheOnly] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const res = await api.getTimeline(selectedUserId);
        setTimeline(res.timeline.reverse()); // Latest first
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [selectedUserId]);

  const filteredTimeline = timeline.filter((day, i) => {
    if (headacheOnly && !day.headache) return false;
    if (filter === '7' && i >= 7) return false;
    if (filter === '30' && i >= 30) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <select 
            className="bg-slate-900 border border-slate-800 text-sm text-slate-300 rounded-md px-3 py-1.5 outline-none focus:border-slate-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="all">All history</option>
          </select>
          
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer ml-4">
            <input 
              type="checkbox" 
              className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/20"
              checked={headacheOnly}
              onChange={(e) => setHeadacheOnly(e.target.checked)}
            />
            Headache days only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Card key={i} className="h-14 animate-pulse bg-slate-800/50" />)}
        </div>
      ) : (
        <div>
          {filteredTimeline.map((day: any) => (
            <LogRow key={day.date} day={day} />
          ))}
          {filteredTimeline.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No records found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

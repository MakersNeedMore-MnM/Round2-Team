import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/Card';
import { Shield, BrainCircuit, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { selectedUserId } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const [baseline, patterns] = await Promise.all([
          api.getBaseline(selectedUserId),
          api.getPatterns(selectedUserId)
        ]);
        setData({ baseline, patterns });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedUserId]);

  if (loading || !data) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-xl" />;
  }

  const { baseline, patterns } = data;
  
  const getFormat = (key: string, val: number) => {
    if (key === 'activity_steps') return val.toLocaleString();
    return val.toFixed(1);
  };
  
  const getUnit = (key: string) => {
    const units: Record<string, string> = {
      sleep_hours: 'h', hydration_liters: 'L', stress: '/ 10', activity_steps: 'steps', caffeine: 'servings'
    };
    return units[key] || '';
  };

  const getLabel = (key: string) => key.replace('_', ' ');

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-12">
      
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-slate-100">{selectedUserId}</h2>
            <p className="text-sm text-slate-400">{patterns.evidence.total_days} days of recorded history</p>
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Your Personal Baseline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.keys(baseline.personal).map(k => (
            <Card key={k} className="bg-slate-900 border-slate-800 hover:bg-slate-800/50 transition-colors">
              <CardContent className="p-5">
                <div className="text-xs text-slate-500 mb-2 capitalize">{getLabel(k)}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-medium text-slate-200">{getFormat(k, baseline.personal[k])}</span>
                  <span className="text-slate-500 text-sm">{getUnit(k)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4" />
          You vs Population
        </h3>
        <Card className="bg-slate-900/50 border-slate-800">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {Object.keys(baseline.comparison).map(k => {
              const comp = baseline.comparison[k];
              const isLower = comp.percent_difference < 0;
              return (
                <div key={k}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300 capitalize">{getLabel(k)}</span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", 
                      isLower ? "text-indigo-400 bg-indigo-500/10" : "text-emerald-400 bg-emerald-500/10"
                    )}>
                      {isLower ? '' : '+'}{comp.percent_difference.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center text-sm">
                      <span className="w-16 text-slate-500 text-xs">You</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="w-16 text-right text-slate-300 font-medium">{getFormat(k, comp.current)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="w-16 text-slate-500 text-xs">Population</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden mx-3">
                        <div className="h-full bg-slate-600 rounded-full" style={{ width: isLower ? '85%' : '55%' }}></div>
                      </div>
                      <span className="w-16 text-right text-slate-400">{getFormat(k, comp.baseline)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          What LifePrint has learned
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.relationships.map((rel: any, i: number) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="p-5 flex justify-between items-center">
                <div>
                  <div className="text-slate-200 font-medium capitalize mb-1">{rel.feature.replace('_', ' ')}</div>
                  <div className={cn("text-sm", rel.direction === 'positive' ? 'text-emerald-400/80' : 'text-amber-400/80')}>
                    {rel.direction === 'positive' ? 'Positive association' : 'Negative association'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Strength</div>
                  <div className="text-slate-300 font-medium">
                    {Math.abs(rel.strength) > 0.5 ? 'Strong' : Math.abs(rel.strength) > 0.3 ? 'Moderate' : 'Weak'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {patterns.relationships.length === 0 && (
            <div className="col-span-2 py-8 text-center text-slate-500">
              Not enough distinct data to extract personal patterns yet.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

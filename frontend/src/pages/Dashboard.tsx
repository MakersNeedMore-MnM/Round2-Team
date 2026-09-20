import { useMemo } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from '../components/ui/Card';
import { Moon, Droplets, Activity as ActivityIcon, Coffee, BrainCircuit, ArrowDown, ArrowUp, AlertCircle, Flame } from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const METRICS_CONFIG = {
  sleep_hours: { label: 'Sleep', unit: 'h', icon: Moon, inverse: false },
  hydration_liters: { label: 'Hydration', unit: 'L', icon: Droplets, inverse: false },
  stress: { label: 'Stress', unit: '/10', icon: BrainCircuit, inverse: true },
  activity_steps: { label: 'Activity', unit: 'steps', icon: ActivityIcon, inverse: false },
  caffeine: { label: 'Caffeine', unit: 'servings', icon: Coffee, inverse: true },
};

function MetricCard({ keyName, config, current, baseline, deviation }: any) {
  const Icon = config.icon;
  const isNegative = deviation < 0;
  
  // Is it "bad" negative? e.g. sleep is lower = bad (amber), stress is lower = good (emerald)
  const isBad = config.inverse ? !isNegative : isNegative;
  // Format based on value scale
  const fmt = (v: number) => keyName === 'activity_steps' ? v.toLocaleString() : v.toFixed(1);

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-slate-700 hover:bg-slate-800/50">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
            <Icon className="w-5 h-5 text-slate-300" />
          </div>
          <div className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1", 
            Math.abs(deviation) < 5 ? "text-slate-400 bg-slate-800" : (isBad ? "text-amber-400 bg-amber-400/10" : "text-emerald-400 bg-emerald-400/10")
          )}>
            {isNegative ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
            {Math.abs(deviation).toFixed(1)}%
          </div>
        </div>
        
        <h4 className="text-slate-400 text-sm font-medium mb-1">{config.label}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-100">{fmt(current)}</span>
          <span className="text-slate-500 text-sm">{config.unit}</span>
        </div>

        <div className="mt-4 text-xs text-slate-500 flex justify-between border-t border-slate-800/50 pt-3">
          <span>Baseline</span>
          <span className="text-slate-400 font-medium">{fmt(baseline)} {config.unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, loading } = useDashboardData();

  // Consistency Streak Calculation
  const streak = useMemo(() => {
    if (!data?.timeline) return 0;
    let count = 0;
    // Iterate backwards from latest
    const sorted = [...data.timeline].reverse();
    for (const day of sorted) {
      // simple rule: sleep > 6 and hydration > 1.5
      if (day.sleep_hours >= 6.0 && day.hydration_liters >= 1.5) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [data]);

  // Last 7 days for calendar
  const last7Days = useMemo(() => {
    if (!data?.timeline) return [];
    return [...data.timeline].reverse().slice(0, 7).reverse();
  }, [data]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <Card key={i} className="h-32 animate-pulse bg-slate-800/50" />)}
      </div>
    );
  }

  const { today, prediction, explanation, patterns } = data;
  const metrics = ['sleep_hours', 'hydration_liters', 'stress', 'activity_steps', 'caffeine'];


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-slate-100">Today's Health</h2>
          <p className="text-sm text-slate-400">{new Date(today.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Based on latest data</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map(k => (
            <MetricCard 
              key={k} 
              keyName={k}
              config={METRICS_CONFIG[k as keyof typeof METRICS_CONFIG]}
              current={today.current[k]}
              baseline={today.personal_baseline[k]}
              deviation={today.deviations[k].percent_difference}
            />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model Estimate */}
        <Card className="lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50"></div>
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start h-full">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-slate-400 font-medium mb-1">Current Health Signal</h3>
                <div className="text-sm text-slate-500">Based on your current recorded health values.</div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className={cn(
                  "text-5xl md:text-6xl font-light tracking-tight",
                  prediction.probability >= 0.7 ? "text-amber-500" : 
                  prediction.probability >= 0.4 ? "text-blue-400" : "text-emerald-400"
                )}>
                  {(prediction.probability * 100).toFixed(0)}%
                </span>
                <span className="text-slate-400 font-medium">likelihood of headache</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                <AlertCircle className="w-3 h-3" />
                Model estimate
              </div>
            </div>
            
            <div className="flex-1 w-full md:border-l border-slate-800 md:pl-8">
              <h4 className="text-sm font-medium text-slate-400 mb-4">Why this estimate?</h4>
              <div className="space-y-4">
                {explanation.factors.slice(0, 3).map((f: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-200 capitalize">{f.feature.replace('_', ' ')}</span>
                      <span className="text-slate-500">{(f.importance * 100).toFixed(0)}% model importance</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/50 rounded-full" style={{ width: `${f.importance * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insight */}
        <Card className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border-indigo-900/30">
          <CardContent className="p-6 md:p-8 flex flex-col h-full">
            <h3 className="text-slate-400 font-medium flex items-center gap-2 mb-4">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              What LifePrint noticed
            </h3>
            
            <div className="flex-1 flex items-center">
              {patterns.primary_pattern ? (
                <p className="text-lg text-slate-200 leading-relaxed font-light">
                  Your <span className="text-indigo-400 font-medium">{patterns.primary_pattern.feature.replace('_', ' ')}</span> has been {patterns.primary_pattern.direction === 'positive' ? 'higher' : 'lower'} than your usual level on several days associated with headaches.
                </p>
              ) : (
                <p className="text-slate-400 italic">No significant patterns detected yet.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-900/30 text-xs text-slate-500 flex justify-between">
              <span>Observed in your historical data</span>
              <span>{patterns.evidence.total_days} days</span>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Streak */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
             <h3 className="text-slate-400 font-medium mb-1">Health Consistency</h3>
             <p className="text-xs text-slate-500 mb-6">Your recent consistency streak</p>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-100">{streak} <span className="text-sm font-normal text-slate-400">days</span></div>
                  <div className="text-xs text-slate-500">Current streak</div>
                </div>
             </div>

             <div className="flex justify-between items-center gap-1">
                {last7Days.map((day: any, i: number) => {
                  const isConsistent = day.sleep_hours >= 6.0 && day.hydration_liters >= 1.5;
                  const dateObj = new Date(day.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-slate-500">{dayName}</span>
                      <div className={cn("w-6 h-8 rounded-md flex items-center justify-center text-sm transition-colors", 
                        isConsistent ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-slate-800 text-slate-600"
                      )}>
                        {isConsistent ? '🔥' : '·'}
                      </div>
                    </div>
                  )
                })}
             </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
             <h3 className="text-slate-400 font-medium mb-6">Recent Trends (Last 14 Days)</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['sleep_hours', 'stress', 'hydration_liters'].map((metric) => {
                  const data = last7Days.slice(-14);
                  return (
                    <div key={metric} className="h-32">
                      <div className="text-xs text-slate-500 mb-2 capitalize">{metric.replace('_', ' ')}</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                          <Line type="monotone" dataKey={metric} stroke="#3b82f6" strokeWidth={2} dot={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: any) => [Number(value).toFixed(1), metric.replace('_', ' ')]}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })}
             </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

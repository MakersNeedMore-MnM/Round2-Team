import { useState, useEffect,  } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { ArrowRight, Activity } from 'lucide-react';

export default function WhatIf() {
  const { selectedUserId } = useUser();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [today, setToday] = useState<any>(null);
  
  const [values, setValues] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [outcome, setOutcome] = useState('headache');

  useEffect(() => {
    async function fetchInitial() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const data = await api.getTodayHealth(selectedUserId);
        setToday(data.current);
        setValues({
          sleep_hours: data.current.sleep_hours,
          hydration_liters: data.current.hydration_liters,
          stress: data.current.stress,
          activity_steps: data.current.activity_steps,
          caffeine: data.current.caffeine
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitial();
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId || Object.keys(values).length === 0) return;
    
    const runSim = async () => {
      setSimulating(true);
      try {
        const res = await api.simulateWhatIf(selectedUserId, values);
        setResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setSimulating(false);
      }
    };
    
    const timeout = setTimeout(runSim, 300); // debounce
    return () => clearTimeout(timeout);
  }, [values, selectedUserId]);

  const handleChange = (key: string, val: number) => {
    setValues((prev: any) => ({ ...prev, [key]: val }));
  };

  const getDiffs = () => {
    if (!today || !values) return [];
    const diffs = [];
    for (const k of Object.keys(values)) {
      const diff = values[k] - today[k];
      if (Math.abs(diff) > 0.01) {
        diffs.push({ key: k, diff, current: today[k], simulated: values[k] });
      }
    }
    return diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  };

  const diffs = getDiffs();

  if (loading || !today) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-xl" />;
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Target Outcome:</span>
          <select 
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 outline-none font-medium"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="headache">Headache</option>
            {/* Architecture supports more, but UI respects limitation */}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Output Panel */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light text-slate-300">
                    {result ? (result.current_risk * 100).toFixed(0) : '--'}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2">Model-estimated likelihood</div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border shadow-lg transition-all duration-500",
              simulating ? "opacity-50" : "opacity-100",
              result && result.difference < 0 ? "border-emerald-500/50 bg-emerald-950/20" : 
              result && result.difference > 0 ? "border-amber-500/50 bg-amber-950/20" : 
              "border-slate-700 bg-slate-800"
            )}>
              <CardContent className="p-6">
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  Simulated
                  {simulating && <div className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-blue-500 animate-spin" />}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-4xl font-medium", 
                    result && result.difference < 0 ? "text-emerald-400" : 
                    result && result.difference > 0 ? "text-amber-400" : "text-slate-100"
                  )}>
                    {result ? (result.simulated_risk * 100).toFixed(0) : '--'}%
                  </span>
                </div>
                
                <div className="text-xs font-medium mt-2 flex items-center gap-1">
                  {result && result.difference !== 0 ? (
                    <span className={result.difference < 0 ? "text-emerald-500" : "text-amber-500"}>
                      {result.difference > 0 ? '+' : ''}{(result.difference * 100).toFixed(1)} percentage points
                    </span>
                  ) : (
                    <span className="text-slate-500">No change</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-slate-300 mb-4">What changed?</h3>
              {diffs.length > 0 ? (
                <div className="space-y-3">
                  {diffs.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 capitalize">{d.key.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{d.current.toFixed(1)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className={cn("font-medium", d.diff > 0 ? "text-blue-400" : "text-indigo-400")}>
                          {d.simulated.toFixed(1)}
                        </span>
                        <span className={cn("text-xs ml-2", d.diff > 0 ? "text-blue-500/70" : "text-indigo-500/70")}>
                          ({d.diff > 0 ? '+' : ''}{d.diff.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Adjust sliders to see changes.</p>
              )}

              {/* LLM Placeholder / Explanation */}
              <div className="mt-6 p-4 rounded-lg bg-slate-950 border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30"></div>
                <div className="flex gap-3">
                  <Activity className="w-5 h-5 text-blue-500/70 shrink-0" />
                  <div>
                    <h4 className="text-xs font-medium text-slate-300 mb-1">Analytical Insight</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {diffs.length > 0 ? 
                        `The simulation recalculates the model estimate based on your provided inputs. The largest absolute change was applied to ${diffs[0].key.replace('_', ' ')}.` :
                        "This component will later accept an LLM-generated explanation of the simulated changes and their projected effects on your personal baseline."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Panel */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-6 md:p-8 space-y-8">
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">Sleep</label>
                <span className="text-slate-500 text-xs">Current: {today.sleep_hours.toFixed(1)} h</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="3" max="12" step="0.5"
                  className="w-full accent-blue-500"
                  value={values.sleep_hours}
                  onChange={(e) => handleChange('sleep_hours', parseFloat(e.target.value))}
                />
                <span className="w-12 text-right font-medium text-slate-200">{values.sleep_hours.toFixed(1)} h</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">Hydration</label>
                <span className="text-slate-500 text-xs">Current: {today.hydration_liters.toFixed(1)} L</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0.5" max="5" step="0.1"
                  className="w-full accent-blue-500"
                  value={values.hydration_liters}
                  onChange={(e) => handleChange('hydration_liters', parseFloat(e.target.value))}
                />
                <span className="w-12 text-right font-medium text-slate-200">{values.hydration_liters.toFixed(1)} L</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">Stress</label>
                <span className="text-slate-500 text-xs">Current: {today.stress.toFixed(1)} / 10</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="10" step="0.5"
                  className="w-full accent-blue-500"
                  value={values.stress}
                  onChange={(e) => handleChange('stress', parseFloat(e.target.value))}
                />
                <span className="w-12 text-right font-medium text-slate-200">{values.stress.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">Activity</label>
                <span className="text-slate-500 text-xs">Current: {today.activity_steps} steps</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="25000" step="500"
                  className="w-full accent-blue-500"
                  value={values.activity_steps}
                  onChange={(e) => handleChange('activity_steps', parseFloat(e.target.value))}
                />
                <span className="w-12 text-right font-medium text-slate-200">{values.activity_steps}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-300">Caffeine</label>
                <span className="text-slate-500 text-xs">Current: {today.caffeine.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="8" step="1"
                  className="w-full accent-blue-500"
                  value={values.caffeine}
                  onChange={(e) => handleChange('caffeine', parseFloat(e.target.value))}
                />
                <span className="w-12 text-right font-medium text-slate-200">{values.caffeine}</span>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

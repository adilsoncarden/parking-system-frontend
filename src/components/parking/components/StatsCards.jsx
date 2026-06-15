import { Database, Home, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const Card = ({ title, value, icon: Icon, colorClass, borderColorClass }) => (
  <div className={clsx("bg-white rounded-lg border border-gray-200 p-6 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow", borderColorClass)}>
    <div className="flex justify-between items-start mb-2">
      {title && <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>}
      {Icon && <Icon className={clsx("w-5 h-5", colorClass)} />}
    </div>
    <div className="mt-auto">
      <span className="text-4xl font-bold text-gray-900">{value}</span>
    </div>
  </div>
);

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card 
        title="TOTAL REGISTRADOS" 
        value={stats.total} 
        icon={Database} 
        colorClass="text-gray-400"
        borderColorClass=""
      />
      <Card 
        title="RESIDENTES ACTIVOS" 
        value={stats.activeResidents} 
        icon={Home} 
        colorClass="text-emerald-400"
        borderColorClass="border-l-4 border-l-emerald-400"
      />
      <Card 
        title="PASES TEMPORALES" 
        value={stats.temporalPasses} 
        icon={Clock} 
        colorClass="text-slate-600"
        borderColorClass="border-l-4 border-l-slate-600"
      />
      <Card 
        title="" 
        value={stats.alerts} 
        icon={AlertTriangle} 
        colorClass="text-red-500"
        borderColorClass="border-l-4 border-l-red-500"
      />
    </div>
  );
};

export default StatsCards;
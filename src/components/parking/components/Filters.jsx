import { Calendar, ChevronDown, RefreshCw } from "lucide-react";

const Filters = ({ 
  searchTerm, setSearchTerm, 
  unitFilter, setUnitFilter, 
  typeFilter, setTypeFilter,
  startDate, setStartDate,
  endDate, setEndDate,
  onClearFilters
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-end">
        
        {/* DATE RANGE */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Rango de Fechas
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* SEARCH */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Placa
          </label>
          <input 
            type="text"
            placeholder="Buscar placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        {/* UNIT */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Unidad / Residente
          </label>
          <div className="relative">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none"
            >
              <option>Todas las Unidades</option>
              <option>Unit 105</option>
              <option>Unit 301</option>
              <option>Unit 402</option>
              <option>Unit 510</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="lg:col-span-3 flex gap-2">
          <button 
            onClick={() => setTypeFilter(typeFilter === 'Entradas' ? 'Todos' : 'Entradas')}
            className={`px-4 py-2 text-sm rounded-lg border ${
              typeFilter === 'Entradas'
                ? 'bg-slate-100'
                : 'bg-slate-50'
            }`}
          >
            Entradas
          </button>

          <button 
            onClick={() => setTypeFilter(typeFilter === 'Salidas' ? 'Todos' : 'Salidas')}
            className={`px-4 py-2 text-sm rounded-lg border ${
              typeFilter === 'Salidas'
                ? 'bg-slate-100'
                : 'bg-slate-50'
            }`}
          >
            Salidas
          </button>

          <button
            onClick={onClearFilters}
            className="p-2.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
            title="Limpiar filtros"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Filters;
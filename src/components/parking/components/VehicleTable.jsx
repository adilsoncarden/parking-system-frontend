import React, { useState, useEffect } from 'react';
import { Car, BusFront, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Badge = ({ status }) => {
  const isActive = status === 'Activo';
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
    )}>
      <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", isActive ? "bg-emerald-500" : "bg-red-500")}></span>
      {status}
    </span>
  );
};

const VehicleTable = ({ vehicles, totalCount }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [vehicles]);

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = vehicles.slice(startIndex, startIndex + itemsPerPage);
  
  const startItem = vehicles.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + itemsPerPage, vehicles.length);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Placa</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Unidad / Apt</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Propietario / Inquilino</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Expiración</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 mr-3 border border-gray-200">
                      {vehicle.type === 'Residente' ? <Car className="h-4 w-4" /> : <BusFront className="h-4 w-4 text-red-400" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{vehicle.plate}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{vehicle.unit}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{vehicle.owner}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{vehicle.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge status={vehicle.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={clsx(
                    "text-sm font-medium", 
                    vehicle.status === 'Expirado' ? "text-red-600" : "text-gray-500"
                  )}>
                    {vehicle.type === 'Temporal' ? formatDate(vehicle.expiration) : '--'}
                  </span>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron vehículos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50/50 px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500 text-center sm:text-left">
          Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{vehicles.length}</span> entradas
          {totalCount !== vehicles.length && ` (filtrado de ${totalCount} en total)`}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-1">
              {getPageNumbers().map((page, idx) => (
                <button 
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={typeof page !== 'number'}
                  className={clsx(
                    "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                    page === currentPage 
                      ? "bg-gray-900 text-white" 
                      : typeof page === 'number' 
                        ? "text-gray-600 hover:bg-gray-100 cursor-pointer" 
                        : "text-gray-400 cursor-default"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleTable;

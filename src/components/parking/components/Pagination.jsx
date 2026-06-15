import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginationRange } from "../../../utils/pagination";

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(currentPage, totalPages, 1);

  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && setCurrentPage(page)}
          disabled={page === "…"}
          className={`
            min-w-8 h-8 flex items-center justify-center text-sm rounded-md font-medium transition-colors
            ${
              page === currentPage
                ? "bg-black text-white"
                : page === "…"
                  ? "text-slate-400 cursor-default"
                  : "text-slate-600 hover:bg-slate-100"
            }
          `}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;

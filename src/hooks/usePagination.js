import { useState, useEffect, useMemo } from "react";

export const PAGE_SIZE = 10;

export const usePagination = (items, pageSize = PAGE_SIZE) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, currentPage, pageSize]);

    const rowIndex = (index) => (currentPage - 1) * pageSize + index + 1;

    return {
        paginatedItems,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems: items.length,
        pageSize,
        rowIndex,
    };
};

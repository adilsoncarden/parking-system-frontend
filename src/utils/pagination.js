// Genera la lista de páginas a mostrar con elipsis, estilo paginador moderno:
//   1 … 5 6 [7] 8 9 … 345
// - Siempre muestra la primera y la última.
// - Muestra una "ventana" de páginas alrededor de la actual (siblings a cada lado).
// - Inserta "…" (string) donde se omiten páginas.
//
// Devuelve un array de números y/o la cadena "…".
export function getPaginationRange(currentPage, totalPages, siblings = 1) {
  // Cuántos números cabrían sin necesidad de elipsis:
  // primera + última + actual + 2*siblings + 2 huecos de "…"
  const totalNumbers = siblings * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblings, 1);
  const rightSibling = Math.min(currentPage + siblings, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  // Caso: solo elipsis a la derecha → 1 2 3 4 5 … N
  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings;
    const left = Array.from({ length: leftCount }, (_, i) => i + 1);
    return [...left, "…", lastPage];
  }

  // Caso: solo elipsis a la izquierda → 1 … N-4 N-3 N-2 N-1 N
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings;
    const right = Array.from({ length: rightCount }, (_, i) => totalPages - rightCount + 1 + i);
    return [firstPage, "…", ...right];
  }

  // Caso: elipsis a ambos lados → 1 … k-1 k k+1 … N
  const middle = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [firstPage, "…", ...middle, "…", lastPage];
}

import React from "react";

/**
 * Pagination controls with first/prev/next/last and page number buttons.
 * Props:
 * - currentPage: number
 * - totalPages: number
 * - onPageChange: (page: number) => void
 */
export default function PaginationControls({ currentPage, totalPages, onPageChange }) {
  /** Create a pagination button */
  function createPageBtn(label, target, disabled, active) {
    return (
      <button
        key={label + target}
        className={`page-btn ${active ? "active" : ""}`}
        disabled={disabled}
        onClick={() => { if (!disabled) onPageChange(target); }}
      >
        {label}
      </button>
    );
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) {
    pages.push(createPageBtn(p, p, false, p === currentPage));
  }

  return (
    <div className="panel-pagination">
      {createPageBtn("<<", 1, currentPage === 1)}
      {createPageBtn("<", currentPage - 1, currentPage === 1)}
      {pages}
      {createPageBtn(">", currentPage + 1, currentPage === totalPages)}
      {createPageBtn(">>", totalPages, currentPage === totalPages)}
    </div>
  );
}
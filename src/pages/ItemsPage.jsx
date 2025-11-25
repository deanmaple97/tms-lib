// src/pages/ItemsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadAllItems } from "../data";
import { getScrollImage } from "../utils";

/** Items listing page */
export default function ItemsPage() {
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const { items } = await loadAllItems();
        if (!cancelled) {
          setItems(items);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = items.slice(startIndex, startIndex + pageSize);

  /** Create a pagination button */
  function createPageBtn(label, target, disabled, active) {
    return (
      <button
        key={label + target}
        className={`page-btn ${active ? "active" : ""}`}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setCurrentPage(target);
        }}
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

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Item</div>
        </div>
        <div className="panel-body">
          <p className="text-mute">Loading items...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Item</div>
        <div className="panel-controls">
          <span>Show:</span>
          <select
            className="panel-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={200}>200</option>
          </select>
          <div className="panel-pagination">
            {createPageBtn("<<", 1, currentPage === 1)}
            {createPageBtn("<", currentPage - 1, currentPage === 1)}
            {pages}
            {createPageBtn(">", currentPage + 1, currentPage === totalPages)}
            {createPageBtn(">>", totalPages, currentPage === totalPages)}
          </div>
        </div>
      </div>

      <div id="itemGrid" className="grid">
        {pageData.map((it) => (
          <div
            key={it.id}
            className="cardbox"
            onClick={() => navigate(`/item/${it.id}`)}
          >
            <img
              src={getScrollImage(it)}
              className="thumb-img"
              alt={it.name}
              title={it.name}
            />
            <div>{it.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

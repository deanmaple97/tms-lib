import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setPaginationState, getPaginationState } from "../utils";
import { loadAllItems } from "../data";
import { getScrollImage } from "../utils";
import PaginationControls from "./PaginationControls.jsx";

/**
 * Reusable item listing page.
 * categoryFilter = "Consume" | "Etc" | "Install"
 * title = Page title e.g. "Use", "Etc", "Setup"
 */
/** Reusable item listing page */
export default function ItemListPage({ categoryFilter, title }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const routePath =
    categoryFilter === "Consume"
      ? "/use"
      : categoryFilter === "Install"
      ? "/setup"
      : categoryFilter === "Etc"
      ? "/etc"
      : "/items";
  const saved = getPaginationState(routePath);
  const initialPage = Number(searchParams.get("page")) || saved?.page || 1;
  const initialSize = Number(searchParams.get("size")) || saved?.size || 100;
  const [pageSize, setPageSize] = useState(initialSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const { items } = await loadAllItems();

        if (!cancelled) {
          const filtered = items.filter(
            (it) => String(it.category) === String(categoryFilter)
          );
          setItems(filtered);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItems();
    return () => (cancelled = true);
  }, [categoryFilter]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = items.slice(startIndex, startIndex + pageSize);

  /** Clamp page when total changes */
  useEffect(() => {
    if (loading) return;
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [loading, totalPages]);

  /** Sync pagination state to URL search params */
  // removed auto-write to avoid history loops

  /** Sync state from URL when user navigates via browser back/forward */
  useEffect(() => {
    const pageParam = Number(searchParams.get("page")) || 1;
    const sizeParam = Number(searchParams.get("size")) || 100;
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    if (sizeParam !== pageSize) setPageSize(sizeParam);
  }, [searchParams]);

  /** Handle page change from controls */
  function handlePageChange(p) {
    setCurrentPage(p);
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    params.set("size", String(pageSize));
    setSearchParams(params, { replace: false });
    setPaginationState(routePath, { page: p, size: pageSize });
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">{title}</div>
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
        <div className="panel-title">{title}</div>

        <div className="panel-controls">
          <span>Show:</span>

          <select
            className="panel-page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
              const params = new URLSearchParams(searchParams);
              params.set("page", "1");
              params.set("size", String(Number(e.target.value)));
              setSearchParams(params, { replace: false });
              setPaginationState(routePath, { page: 1, size: Number(e.target.value) });
            }}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
            <option value={200}>200</option>
          </select>

          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      <div id="itemGrid" className="grid">
        {pageData.map((it) => (
          <div
            key={it.id}
            className="cardbox"
            onClick={() =>
              navigate(`/item/${it.id}`, {
                state: {
                  fromCategory: it.category,
                  returnTo: `${location.pathname}${location.search}`,
                },
              })
            }
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

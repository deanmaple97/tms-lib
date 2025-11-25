import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setPaginationState, getPaginationState } from "../utils";
import { loadEquips } from "../data";
import PaginationControls from "./PaginationControls.jsx";

/**
 * Reusable equip listing page.
 * Props:
 * - category: equip category string (e.g., "Accessory", "Weapon")
 * - title: page title to display
 */
export default function EquipListPage({ category, title }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const saved = getPaginationState(`/equip/${category}`);
  const initialPage = Number(searchParams.get("page")) || saved?.page || 1;
  const initialSize = Number(searchParams.get("size")) || saved?.size || 100;
  /** Page size state for pagination */
  const [pageSize, setPageSize] = useState(initialSize);
  /** Current page index */
  const [currentPage, setCurrentPage] = useState(initialPage);
  /** All equips loaded from data */
  const [equips, setEquips] = useState([]);
  /** Loading indicator */
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /** Load all equips once */
  useEffect(() => {
    let cancelled = false;
    async function fetchEquips() {
      try {
        const { flatEquips } = await loadEquips();
        if (!cancelled) setEquips(flatEquips);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEquips();
    return () => { cancelled = true; };
  }, []);

  /** Filter equips by category from props */
  const filteredEquips = useMemo(
    () => equips.filter((equip) => equip.category === category),
    [equips, category]
  );

  const total = filteredEquips.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredEquips.slice(startIndex, startIndex + pageSize);

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
    setPaginationState(`/equip/${category}`, { page: p, size: pageSize });
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">{title}</div>
        </div>
        <div className="panel-body">
          <p className="text-mute">Loading equips...</p>
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
              setPaginationState(`/equip/${category}`, { page: 1, size: Number(e.target.value) });
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

      <div id="equipGrid" className="grid">
        {pageData.map((equip) => (
          <div
            key={equip.id}
            className="cardbox"
            onClick={() =>
              navigate(`/equip-detail/${equip.id}`, {
                state: { returnTo: `${location.pathname}${location.search}` },
              })
            }
          >
            <img src={equip.image} className="thumb-img" alt={equip.name} title={equip.name} />
            <div>{equip.name}</div>
            <div className="text-mute">Lvl. {equip.stats.reqLevel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
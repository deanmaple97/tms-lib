// src/pages/MonstersPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setPaginationState, getPaginationState } from "../utils";
import { loadAllMobs } from "../data";
import PaginationControls from "../components/PaginationControls.jsx";

/** Monsters listing page */
export default function MonstersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const saved = getPaginationState("/monsters");
  const initialPage = Number(searchParams.get("page")) || saved?.page || 1;
  const initialSize = Number(searchParams.get("size")) || saved?.size || 100;
  const [pageSize, setPageSize] = useState(initialSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobs, setMobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchMobs() {
      try {
        const { mobs } = await loadAllMobs();
        if (!cancelled) {
          setMobs(mobs);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMobs();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = mobs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = mobs.slice(startIndex, startIndex + pageSize);

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
    setPaginationState("/monsters", { page: p, size: pageSize });
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Monsters</div>
        </div>
        <div className="panel-body">
          <p className="text-mute">Loading monsters...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">Monsters</div>
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
              setPaginationState("/monsters", { page: 1, size: Number(e.target.value) });
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

      <div id="monsterGrid" className="grid">
        {pageData.map((m) => (
          <div
            key={m.id}
            className="cardbox"
            onClick={() =>
              navigate(`/monster/${m.id}`, {
                state: { returnTo: `${location.pathname}${location.search}` },
              })
            }
          >
            <img src={m.img} className="thumb-img" alt={m.name} title={m.name}/>
            <div>{m.name}</div>
            <div className="text-mute">Lv. {m.level}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

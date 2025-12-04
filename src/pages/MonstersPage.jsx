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
  const initialSearch = searchParams.get("q") || saved?.q || "";
  const initialBoss = searchParams.get("boss") || saved?.boss || "All";
  const [pageSize, setPageSize] = useState(initialSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [mobs, setMobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [bossFilter, setBossFilter] = useState(initialBoss);

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

  let filtered = mobs;
  if (bossFilter !== "All") {
    filtered = filtered.filter((m) => {
      const isBoss = Number(m.boss) === 1;
      return bossFilter === "Boss" ? isBoss : !isBoss;
    });
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((m) => String(m.name).toLowerCase().includes(q));
  }
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(startIndex, startIndex + pageSize);

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
    const qParam = searchParams.get("q") || "";
    const bossParam = searchParams.get("boss") || "All";
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    if (sizeParam !== pageSize) setPageSize(sizeParam);
    if (qParam !== searchQuery) setSearchQuery(qParam);
    if (bossParam !== bossFilter) setBossFilter(bossParam);
  }, [searchParams]);

  /** Handle page change from controls */
  function persistState(next) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next.page ?? currentPage));
    params.set("size", String(next.size ?? pageSize));
    params.set("boss", String(next.boss ?? bossFilter));
    const qValue = next.q ?? searchQuery;
    if (qValue && String(qValue).trim()) params.set("q", String(qValue)); else params.delete("q");
    setSearchParams(params, { replace: false });
    setPaginationState("/monsters", { page: Number(params.get("page")), size: Number(params.get("size")), q: params.get("q") || "", boss: params.get("boss") });
  }

  function handlePageChange(p) {
    setCurrentPage(p);
    persistState({ page: p });
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
            <div className="panel-controls-child">
              <input
                className="timeless-input"
                placeholder="Search..."
                value={searchQuery}
              onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  setCurrentPage(1);
                  persistState({ page: 1, q: v });
                }}
                style={{ marginRight: 8 }}
              />
              <span>Type:</span>
              <select
                className="panel-page-size"
                value={bossFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setBossFilter(v);
                  setCurrentPage(1);
                  persistState({ page: 1, boss: v });
                }}
              >
                {["All", "Boss", "Normal"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="panel-controls-child">
              <span>Show:</span>
              <select
                className="panel-page-size"
                value={pageSize}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPageSize(v);
                  setCurrentPage(1);
                  persistState({ page: 1, size: v });
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

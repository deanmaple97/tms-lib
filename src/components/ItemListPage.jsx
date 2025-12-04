import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setPaginationState, getPaginationState } from "../utils";
import { loadAllItems, loadDrops, loadAllMobs } from "../data";
import { getScrollImage, withBase } from "../utils";
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
  const initialSearch = searchParams.get("q") || saved?.q || "";
  const initialMobType = searchParams.get("mobType") || saved?.mobType || "All";
  const initialCat = searchParams.get("cat") || saved?.cat || "All";
  const [pageSize, setPageSize] = useState(initialSize);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [mobTypeFilter, setMobTypeFilter] = useState(initialMobType);
  const [categoryNameFilter, setCategoryNameFilter] = useState(initialCat);
  const [dropMeta, setDropMeta] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [{ items }, drops, { mobMap }] = await Promise.all([
          loadAllItems(),
          loadDrops(),
          loadAllMobs(),
        ]);

        if (!cancelled) {
          const filtered = items.filter(
            (it) => String(it.category) === String(categoryFilter)
          );
          setItems(filtered);

          const meta = {};
          for (const d of drops) {
            const itemId = Number(d.itemid);
            if (!itemId) continue; // skip mesos etc
            const mob = mobMap[String(d.dropperid)];
            const isBoss = Number(mob?.boss) === 1;
            const m = meta[itemId] || { hasBoss: false, hasNormal: false };
            if (isBoss) m.hasBoss = true; else m.hasNormal = true;
            meta[itemId] = m;
          }
          setDropMeta(meta);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => (cancelled = true);
  }, [categoryFilter]);

  let filtered = items;
  if (mobTypeFilter !== "All") {
    filtered = filtered.filter((it) => {
      const meta = dropMeta[Number(it.id)] || { hasBoss: false, hasNormal: false };
      if (mobTypeFilter === "Boss") return meta.hasBoss;
      if (mobTypeFilter === "Mob") return meta.hasNormal;
      return true;
    });
  }
  if (categoryFilter === "Consume" && categoryNameFilter !== "All") {
    filtered = filtered.filter((it) => {
      const n = String(it.name || "").toLowerCase();
      const cat = 
        n.includes("scroll") || n.includes("dragon stone")  || n.includes("balrog") && !n.includes("summoning") && !n.includes("summon") && !n.includes("card")
        ? "Scrolls"
        : n.includes("mastery book") || n.includes("skill book")
        ? "Mastery Book"
        : n.includes("knives") || n.includes("stars") || n.includes("knife")
        ? "Throwing Stars"
        : n.includes("bullet")
        ? "Bullets"
        : n.includes("arrow")
        ? "Arrows"
        : n.includes("card")
        ? "Monster Card"
        : n.includes("summoning") || n.includes("sack")
        ? "Summoning Sacks"

        : "Others";
      return cat === categoryNameFilter;
    });
  }
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((it) => String(it.name).toLowerCase().includes(q));
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
    let mobTypeParam = searchParams.get("mobType") || "All";
    const catParam = searchParams.get("cat") || "All";
    if (mobTypeParam === "Both") mobTypeParam = "All";
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    if (sizeParam !== pageSize) setPageSize(sizeParam);
    if (qParam !== searchQuery) setSearchQuery(qParam);
    if (mobTypeParam !== mobTypeFilter) setMobTypeFilter(mobTypeParam);
    if (catParam !== categoryNameFilter) setCategoryNameFilter(catParam);
  }, [searchParams]);

  /** Handle page change from controls */
  function persistState(next) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next.page ?? currentPage));
    params.set("size", String(next.size ?? pageSize));
    params.set("mobType", String(next.mobType ?? mobTypeFilter));
    params.set("cat", String(next.cat ?? categoryNameFilter));
    const qValue = next.q ?? searchQuery;
    if (qValue && String(qValue).trim()) params.set("q", String(qValue)); else params.delete("q");
    setSearchParams(params, { replace: false });
    setPaginationState(routePath, { page: Number(params.get("page")), size: Number(params.get("size")), q: params.get("q") || "", mobType: params.get("mobType") });
  }

  function handlePageChange(p) {
    setCurrentPage(p);
    persistState({ page: p });
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
            <span>Drop From:</span>
            <select
              className="panel-page-size"
              value={mobTypeFilter}
              onChange={(e) => {
                const v = e.target.value;
                setMobTypeFilter(v);
                setCurrentPage(1);
                persistState({ page: 1, mobType: v });
              }}
            >
              {["All", "Mob", "Boss"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            {categoryFilter === "Consume" && (
              <>
                <span style={{ marginLeft: 8 }}>Category:</span>
                <select
                  className="panel-page-size"
                  value={categoryNameFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCategoryNameFilter(v);
                    setCurrentPage(1);
                    persistState({ page: 1, cat: v });
                  }}
                >
                  {["All", "Scrolls", "Mastery Book", "Throwing Stars", "Bullets", "Arrows", "Summoning Sacks", "Monster Card", "Others"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </>
            )}
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

      <div id="itemGrid" className={categoryFilter === "Install" ? "masonry-grid" : "grid"}>
        {pageData.map((it) => (
          <div
            key={it.id}
            className={categoryFilter === "Install" ? "cardbox cardbox-install masonry-item" : "cardbox"}
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
              src={categoryFilter === "Install" && it.apng ? withBase(it.apng) : getScrollImage(it)}
              className={categoryFilter === "Install" ? "item-apng-preview" : "thumb-img"}
              alt={it.name}
              title={it.name}
            />
            {categoryFilter === "Install" && it.apng && (
              <div className="apng-hover-panel">
                <img
                  src={withBase(it.apng)}
                  className="apng-hover-img"
                  alt={it.name}
                  title={it.name}
                />
              </div>
            )}
            <div>{it.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

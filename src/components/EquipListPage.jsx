import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { setPaginationState, getPaginationState } from "../utils";
import { loadEquips } from "../data";
import PaginationControls from "./PaginationControls.jsx";
import { WEAPON_IDS, WEAPON_TYPE_ORDER } from "../utils/weaponId.js";
import { ACCESSORY_IDS, ACCESSORY_TYPE_ORDER } from "../utils/accessoryId.js";
import { getJobAllowed } from "../utils/equip.js";

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
  const initialType = searchParams.get("type") || saved?.type || "All";
  const initialJob = searchParams.get("job") || saved?.job || "All";
  const initialSearch = searchParams.get("q") || saved?.q || "";
  /** Page size state for pagination */
  const [pageSize, setPageSize] = useState(initialSize);
  /** Current page index */
  const [currentPage, setCurrentPage] = useState(initialPage);
  /** All equips loaded from data */
  const [equips, setEquips] = useState([]);
  /** Loading indicator */
  const [loading, setLoading] = useState(true);
  const [weaponType, setWeaponType] = useState(initialType);
  const [jobFilter, setJobFilter] = useState(initialJob);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

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

  /** Filter equips by category + optional job/type */
  const filteredEquips = useMemo(() => {
    let base = equips.filter((equip) => equip.category === category);
    if (jobFilter !== "All") {
      base = base.filter((eq) => {
        const req = Number(eq.stats?.reqJob);
        if (jobFilter === "Super Beginner") {
          return category === "Weapon" ? req === -1 : (req === -1 || req === 0);
        }
        return getJobAllowed(req, jobFilter);
      });
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      base = base.filter((eq) => String(eq.name).toLowerCase().includes(q));
    }
    if (weaponType === "All") return base;
    const prefixOf = (id) => Number(String(id).replace(/^0+/, "").substring(0, 3));
    const norm = (s) => String(s).toLowerCase();
    if (category === "Weapon") {
      return base.filter((eq) => norm(WEAPON_IDS[prefixOf(eq.id)]) === norm(weaponType));
    }
    if (category === "Accessory") {
      return base.filter((eq) => norm(ACCESSORY_IDS[prefixOf(eq.id)]) === norm(weaponType));
    }
    return base;
  }, [equips, category, weaponType, jobFilter, searchQuery]);

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
    const typeParam = searchParams.get("type") || "All";
    const jobParam = searchParams.get("job") || "All";
    const qParam = searchParams.get("q") || "";
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    if (sizeParam !== pageSize) setPageSize(sizeParam);
    if (typeParam !== weaponType) setWeaponType(typeParam);
    if (jobParam !== jobFilter) setJobFilter(jobParam);
    if (qParam !== searchQuery) setSearchQuery(qParam);
  }, [searchParams]);

  /** Handle page change from controls */
  function persistState(next) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next.page ?? currentPage));
    params.set("size", String(next.size ?? pageSize));
    params.set("job", String(next.job ?? jobFilter));
    if (category === "Weapon" || category === "Accessory") params.set("type", String(next.type ?? weaponType));
    const qValue = next.q ?? searchQuery;
    if (qValue && String(qValue).trim()) params.set("q", String(qValue)); else params.delete("q");
    setSearchParams(params, { replace: false });
    setPaginationState(`/equip/${category}`, { page: Number(params.get("page")), size: Number(params.get("size")), job: params.get("job"), type: params.get("type"), q: params.get("q") || "" });
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
          <p className="text-mute">Loading equips...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div className="panel-title">
          {
            (category === "Weapon" || category === "Accessory") 
            && 
            weaponType !== "All" ? `${title} - ${weaponType} (${jobFilter})` : `${title} (${jobFilter})`
          }
        </div>
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
            />
            <span>Job:</span>
            <select
              className="panel-page-size"
              value={jobFilter}
              onChange={(e) => {
                const v = e.target.value;
                setJobFilter(v);
                setCurrentPage(1);
                persistState({ page: 1, job: v });
              }}
            >
              {[
                "All",
                "Super Beginner",
                "Beginner",
                "Warrior",
                "Magician",
                "Bowman",
                "Thief",
                "Pirate",
              ].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            {(category === "Weapon" || category === "Accessory") && (
              <>
                <span>Type:</span>
                <select
                  className="panel-page-size"
                  value={weaponType}
                  onChange={(e) => {
                    const v = e.target.value;
                    setWeaponType(v);
                    setCurrentPage(1);
                    persistState({ page: 1, type: v });
                  }}
                >
                  <option>All</option>
                  {(category === "Weapon" ? WEAPON_TYPE_ORDER : ACCESSORY_TYPE_ORDER).map((name) => (
                    <option key={name}>{name}</option>
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

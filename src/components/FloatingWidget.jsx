import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiX } from "react-icons/fi";
import { BsBookmarkPlus } from "react-icons/bs";
import { GiBookmark } from "react-icons/gi";
import { CATEGORY_LABELS, withBase } from "../utils";
import { useLocation, useNavigate } from "react-router-dom";

export default function FloatingWidget({ onOpenSearch, onDock, resolveBookmark, showButton = true, triggerAddBookmark = 0, triggerOpenBookmarks = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [edgeLeft, setEdgeLeft] = useState(false);
  const didDragRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const widgetBtnRef = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const pendingMeta = React.useMemo(() => {
    if (!pendingUrl) return null;
    const base = resolveBookmark ? resolveBookmark(pendingUrl) : { url: pendingUrl, name: pendingUrl, image: withBase("images/Common/logo.png"), type: "Page" };
    const name = String(pendingName || base.name).trim().slice(0, 50);
    return { ...base, name };
  }, [pendingUrl, pendingName, resolveBookmark]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("widget:bookmarks");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const next = arr.map((b) => {
            if (typeof b === "string") {
              return resolveBookmark ? resolveBookmark(b) : { url: b, name: b, image: withBase("images/Common/logo.png"), type: "Page" };
            }
            if (b && typeof b === "object" && b.url) return b;
            return null;
          }).filter(Boolean);
          setBookmarks(next);
        }
      }
    } catch {}
  }, [resolveBookmark]);

  function updateWidgetTop(px) {
    const min = 40;
    const max = Math.max(80, window.innerHeight - 80);
    const clamped = Math.min(Math.max(px, min), max);
    document.documentElement.style.setProperty("--widget-top", `${clamped}px`);
  }

  useEffect(() => {
    updateWidgetTop(Math.round(window.innerHeight * 0.8));
    const w = window.innerWidth || 1200;
    const btnW = widgetBtnRef.current?.offsetWidth || 60;
    const hw = Math.round(btnW / 2);
    const margin = 16;
    const center = Math.max(margin + hw, w - margin - hw);
    document.documentElement.style.setProperty("--widget-left", `${center}px`);
    setEdgeLeft(false);
  }, []);

  useEffect(() => {
    function syncOnResize() {
      const w = window.innerWidth || 1200;
      const h = window.innerHeight || 800;
      const btnW = widgetBtnRef.current?.offsetWidth || 60;
      const hw = Math.round(btnW / 2);
      const margin = 16;
      const targetCenter = edgeLeft ? (margin + hw) : (w - margin - hw);
      document.documentElement.style.setProperty("--widget-left", `${Math.round(targetCenter)}px`);
      const rect = widgetBtnRef.current?.getBoundingClientRect();
      const currentY = rect ? (rect.top + rect.height / 2) : Math.round(h * 0.8);
      const min = 40;
      const max = Math.max(80, h - 80);
      const clampedY = Math.min(Math.max(currentY, min), max);
      updateWidgetTop(clampedY);
    }
    window.addEventListener("resize", syncOnResize);
    window.addEventListener("orientationchange", syncOnResize);
    return () => {
      window.removeEventListener("resize", syncOnResize);
      window.removeEventListener("orientationchange", syncOnResize);
    };
  }, [edgeLeft]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocDown(ev) {
      if (!widgetBtnRef.current) return;
      if (widgetBtnRef.current.contains(ev.target)) return;
      setMenuOpen(false);
    }
    window.addEventListener("mousedown", onDocDown);
    window.addEventListener("touchstart", onDocDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDocDown);
      window.removeEventListener("touchstart", onDocDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!triggerAddBookmark) return;
    const url = `${location.pathname}${location.search}`;
    setPendingUrl(url);
    const defName = resolveBookmark ? resolveBookmark(url).name : url;
    setPendingName(String(defName).slice(0, 50));
    setConfirmOpen(true);
  }, [triggerAddBookmark]);

  useEffect(() => {
    if (!triggerOpenBookmarks) return;
    setBookmarksOpen(true);
  }, [triggerOpenBookmarks]);

  useEffect(() => {
    if (showButton) {
      setMenuOpen(false);
    }
  }, [showButton]);

  function onDragStart(e) {
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    didDragRef.current = false;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startYRef.current = clientY;
    startXRef.current = clientX;
    document.documentElement.style.setProperty("--widget-left", `${clientX}px`);
    const onMove = (ev) => {
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const x = ev.touches ? ev.touches[0].clientX : ev.clientX;
      if (Math.abs(y - startYRef.current) > 6 || Math.abs(x - startXRef.current) > 6) didDragRef.current = true;
      updateWidgetTop(y);
      document.documentElement.style.setProperty("--widget-left", `${x}px`);
      const w = window.innerWidth || 1200;
      setEdgeLeft(x < w / 2);
    };
    const onEnd = (ev) => {
      const point = ev.changedTouches ? ev.changedTouches[0] : ev;
      const y = point.clientY;
      const x = point.clientX;
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      const h = window.innerHeight || 800;
      const min = 40;
      const max = Math.max(80, h - 80);
      const clampedY = Math.min(Math.max(y, min), max);
      updateWidgetTop(clampedY);
      const w = window.innerWidth || 1200;
      const btnW = widgetBtnRef.current?.offsetWidth || 60;
      const hw = Math.round(btnW / 2);
      const margin = 16;
      const targetCenter = x < w / 2 ? (margin + hw) : (w - margin - hw);
      document.documentElement.style.setProperty("--widget-left", `${Math.round(targetCenter)}px`);
      setEdgeLeft(x < w / 2);
      const btn = widgetBtnRef.current;
      if (btn) {
        const dirClass = x < w / 2 ? "snap-left" : "snap-right";
        btn.classList.remove("snap-left", "snap-right");
        btn.classList.add(dirClass);
        const clear = () => {
          btn.classList.remove("snap-left", "snap-right");
          btn.removeEventListener("animationend", clear);
        };
        btn.addEventListener("animationend", clear);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  }

  return (
    <>
      {menuOpen && showButton && (
        <div className="widget-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {showButton && (
      <div
        ref={widgetBtnRef}
        className={`widget-float ${dragging ? "dragging" : ""} ${menuOpen ? "open" : ""} ${edgeLeft ? "edge-left" : "edge-right"}`}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        onDragStart={(e) => { e.preventDefault(); }}
        onClick={(e) => {
          if (didDragRef.current) {
            e.preventDefault();
            return;
          }
          setMenuOpen(v => !v);
        }}
        aria-label="Assistive Widget"
        role="button"
      >
        <div className="widget-core">
          <img src={withBase(menuOpen ? "images/Common/widget.gif" : "images/Common/widget.png")} alt="Widget" className="widget-img" draggable={false} />
        </div>

        <div className="widget-item widget-item-1" title="Save bookmark" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => {
          const url = `${location.pathname}${location.search}`;
          setPendingUrl(url);
          const defName = resolveBookmark ? resolveBookmark(url).name : url;
          setPendingName(String(defName).slice(0, 50));
          setMenuOpen(false);
          setConfirmOpen(true);
        }}>
          <BsBookmarkPlus />
        </div>
        <div className="widget-item widget-item-2" title="Bookmarks" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => { setMenuOpen(false); setBookmarksOpen(true); }}>
          <GiBookmark />
        </div>
        <div className="widget-item widget-item-3" title="Settings" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => { setMenuOpen(false); }}>
          <FiSettings />
        </div>
        <div className="widget-item widget-item-4" title="Close" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onClick={() => { setMenuOpen(false); if (onDock) onDock(); }}>
          <FiX />
        </div>
      </div>
      )}

      {bookmarksOpen && (
        <div
          id="bookmarkModalOverlay"
          className="modal-overlay visible"
          onClick={(e) => {
            if (e.target.id === "bookmarkModalOverlay") setBookmarksOpen(false);
          }}
        >
          <div className="modal-panel" tabIndex="0" autoFocus>
            <div className="modal-header">
              <div className="modal-title">Bookmarks</div>
              <button className="modal-close" onClick={() => setBookmarksOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              {bookmarks.length === 0 ? (
                <div className="text-mute">No bookmarks</div>
              ) : (
                <div className="modal-results-grid">
                  {bookmarks.map((b, idx) => (
                    <div
                      key={idx}
                      className="modal-card"
                      onClick={() => { setBookmarksOpen(false); navigate(b.url); }}
                    >
                      <img src={b.image || withBase("images/Common/widget.png")} alt={b.name || "Bookmark"} />
                      <div>{b.name || b.url}</div>
                      <div className="modal-card-type">{CATEGORY_LABELS[b.type] || b.type}</div>
                      <button
                        className="btn bookmark-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = bookmarks.filter((x) => x.url !== b.url);
                          setBookmarks(next);
                          try { localStorage.setItem("widget:bookmarks", JSON.stringify(next)); } catch {}
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div
          id="bookmarkConfirmOverlay"
          className="modal-overlay visible"
          onClick={(e) => {
            if (e.target.id === "bookmarkConfirmOverlay") setConfirmOpen(false);
          }}
        >
          <div className="modal-panel" tabIndex="0" autoFocus>
            <div className="modal-header">
              <div className="modal-title">Save Bookmark?</div>
              <button className="modal-close" onClick={() => setConfirmOpen(false)}>X</button>
            </div>
            <div className="modal-body bookmark-confirm-body">
              <div className="bookmark-preview-grid">
                <div className="modal-card">
                  <img src={(pendingMeta ? pendingMeta.image : withBase("images/Common/widget.png"))} alt="Bookmark" />
                  <div>{pendingMeta ? pendingMeta.name : pendingUrl}</div>
                  <div className="modal-card-type">{pendingMeta ? (CATEGORY_LABELS[pendingMeta.type] || pendingMeta.type) : "Bookmark"}</div>
                </div>
              </div>
              <input
                className="timeless-input bookmark-confirm-input"
                placeholder="Bookmark name"
                maxLength={50}
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value.slice(0, 50))}
                
              />
              <div className="bookmark-confirm-actions">
                <button className="btn bookmark-save-btn" onClick={() => {
                  const meta = pendingMeta || { url: pendingUrl, name: pendingUrl, image: withBase("images/Common/logo.png"), type: "Page" };
                  const exists = bookmarks.some((b) => b.url === meta.url);
                  const next = exists
                    ? bookmarks.map((b) => (b.url === meta.url ? { ...b, ...meta } : b))
                    : [meta, ...bookmarks];
                  setBookmarks(next);
                  try { localStorage.setItem("widget:bookmarks", JSON.stringify(next)); } catch {}
                  setConfirmOpen(false);
                }}>Save</button>
                <button className="btn bookmark-cancel-btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

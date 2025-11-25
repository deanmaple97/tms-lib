// src/components/SearchModal.jsx
import React, { useEffect } from "react";
import { getScrollImage, CATEGORY_LABELS, getBaseUrl } from "../utils";

export default function SearchModal({ open, results, onClose }) {
  // --------------------------------------
  // ESC key to close
  // --------------------------------------
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="searchModalOverlay"
      className="modal-overlay visible"
      onClick={(e) => {
        if (e.target.id === "searchModalOverlay") onClose();
      }}
    >
      <div className="modal-panel" tabIndex="0" autoFocus>
        {/* ---------- Header ---------- */}
        <div className="modal-header">
          <div className="modal-title">Search Results</div>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="modal-body">
          <div id="searchResults" className="modal-results-grid">
            {results.length === 0 ? (
              <div className="text-mute">No results found.</div>
            ) : (
              results.map((r) => {
                const fullUrl = `${window.location.origin}${getBaseUrl()}#${r.link}`;
                
                return (
                  <div
                    key={`${r.type}-${r.id}`}
                    className="modal-card"
                    onClick={() => {
                      window.open(
                        `${fullUrl}`,
                        "_blank"
                      );
                    }}
                  >
                    <img src={getScrollImage(r)} alt={r.name} />
                    <div>{r.name}</div>
                    <div className="modal-card-type">{CATEGORY_LABELS[r.category] || r.category }</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/ItemDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { loadAllItems, loadDrops, loadAllMobs } from "../data";
import { getScrollImage, getScrollName } from "../utils";
import { CATEGORY_LABELS, MOB_TYPE_DROP_RATE } from "../utils";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ============================
  // Dynamic Back Path Logic
  // ============================
  const fromCategory = location.state?.fromCategory;

  const backPath =
    fromCategory === "Consume"
      ? "/use"
      : fromCategory === "Etc"
      ? "/etc"
      : fromCategory === "Install"
      ? "/setup"
      : "/items"; // fallback
  const returnTo = location.state?.returnTo;

  // ============================
  // States
  // ============================
  const [item, setItem] = useState(null);
  const [dropList, setDropList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // MAIN FETCH
  // ============================
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [{ itemMap }, drops, { mobMap }] = await Promise.all([
          loadAllItems(),
          loadDrops(),
          loadAllMobs(),
        ]);

        if (cancelled) return;

        const foundItem = itemMap[id];
        if (!foundItem) {
          setItem(null);
          setDropList([]);
          return;
        }

        // ============================
        // DROP LIST COMPUTE
        // ============================
        const dropsForItem = drops
          .filter((d) => String(d.itemid) === String(id))
          .map((d) => {
            const mob = mobMap[String(d.dropperid)];
            if (!mob) return null;

            const dropRateMultiplier =
              mob.boss == 1 ? MOB_TYPE_DROP_RATE.boss : MOB_TYPE_DROP_RATE.normal;

            const finalChance = (d.chance / 10000) * dropRateMultiplier;
            if (finalChance <= 0) return null;

            return {
              mob,
              chance: finalChance,
              maximum_quantity: d.maximum_quantity,
              minimum_quantity: d.minimum_quantity,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.chance - a.chance);

        setItem(foundItem);
        setDropList(dropsForItem);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => (cancelled = true);
  }, [id]);

  // ====================================
  // HELPER: multiline description
  // ====================================
  function renderMultiline(text) {
    if (!text) return null;
    return text.split("\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  }

  // ====================================
  // LOADING / ERROR UI
  // ====================================
  if (loading) {
    return (
      <div className="page-container">
        <p className="mob-name">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-container">
        <p className="mob-name">Item Not Found</p>
      </div>
    );
  }

  // ====================================
  // MAIN RENDER
  // ====================================
  return (
    <div className="page-container">
      <div className="panel">

        <p className="header-title">
          {CATEGORY_LABELS[item.category]} Information
        </p>

        <div className="flex-detail">
          {/* ITEM IMAGE */}
          <div className="image-card">
            <img
              src={getScrollImage(item)}
              alt={getScrollName(item)}
              title={getScrollName(item)}
              className="float-anim"
            />
          </div>

          {/* RIGHT SIDE DETAILS */}
          <div className="flex-1">
            <p className="mob-name">{getScrollName(item)}</p>

            {item.desc && (
              <p className="item-desc">{renderMultiline(item.desc)}</p>
            )}

            <p className="mob-drop">Dropped By</p>

            <div className="item-drop-mob">
              {dropList.length === 0 ? (
                <p className="text-mute">No monsters drop this item.</p>
              ) : (
                dropList.map(
                  ({ mob, chance, maximum_quantity, minimum_quantity }) => (
                    <div
                      key={mob.id}
                      onClick={() => navigate(`/monster/${mob.id}`)}
                      style={{ cursor: "pointer", textAlign: "center" }}
                    >
                      <img
                        src={mob.img}
                        alt={mob.name}
                        title={mob.name}
                        className="drop-mob"
                      />
                      <div className="text-mute">
                        <div className="drop-chance-text">
                          {chance > 99 ? "100" : chance.toFixed(2)}%
                        </div>
                        <div className="drop-chance-text">
                          {minimum_quantity} ~ {maximum_quantity}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {item.apng &&  (<p className="mob-drop">Preview: </p>)}
              {item.apng && (
                <img
                  src={item.apng}
                  alt={`${getScrollName(item)}`}
                  title={`${getScrollName(item)}`}
                  className="item-apng-preview"
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

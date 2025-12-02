// src/pages/MonsterDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getScrollImage, getScrollName, getFormattedNumber, getElementGroups, MOB_TYPE_DROP_RATE } from "../utils";
import { withBase } from "../utils";

import { loadAllMobs, loadAllItems, loadEquips, loadDrops } from "../data";

/** Format numbers for display */
function format(n) { return getFormattedNumber(n); }

// parseElementString now imported from utils

export default function MonsterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobMap, setMobMap] = useState({});
  const [itemMap, setItemMap] = useState({});
  const [equipCategories, setEquipCategories] = useState([]);
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("chance");
  const [showMesos, setShowMesos] = useState(false);
  const [showDropRate, setShowDropRate] = useState(true);
  const [showItemNames, setShowItemNames] = useState(false);
  const [showQuantity, setShowQuantity] = useState(false);

  // ===============================
  // LOAD ALL DATA
  // ===============================
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [{ mobMap }, { itemMap }, { equipCategories }, dropsData] =
          await Promise.all([
            loadAllMobs(),
            loadAllItems(),
            loadEquips(),
            loadDrops(),
          ]);

        if (cancelled) return;

        setMobMap(mobMap);
        setItemMap(itemMap);
        setEquipCategories(equipCategories);
        setDrops(dropsData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => (cancelled = true);
  }, []);

  const mob = useMemo(() => mobMap[id], [mobMap, id]);

  if (loading) {
    return (
      <div className="page-container">
        <p className="mob-name">Loading monster...</p>
      </div>
    );
  }
  
  if (!mob) {
    return (
      <div className="page-container">
        <p className="mob-name">Monster Not Found</p>
        <p className="text-mute">ID: {id}</p>
      </div>
    );
  }

  // ==================================================
  // 🔥 DETERMINE DROP RATE MULTIPLIER
  // ==================================================
  const dropRateMultiplier =
    mob.boss == 1 ? MOB_TYPE_DROP_RATE.boss : MOB_TYPE_DROP_RATE.normal;

  // ==================================================
  // FILTER & SORT DROPS
  // ==================================================
  const mobDrops = drops.filter((d) => String(d.dropperid) === String(id));
  
  function getMesosForDrop(d) {
    if (d.itemid === 0) {
      return ((Number(d.minimum_quantity) + Number(d.maximum_quantity)) / 2) || 0;
    }
    const cleanId = String(d.itemid);
    const item = itemMap[cleanId];
    if (item) {
      const price = item?.stats?.price ?? item?.price ?? 0;
      return Number(price) || 0;
    }
    const padded = cleanId.padStart(8, "0");
    for (const cat of equipCategories) {
      const eq = cat.find((e) => e.id === padded);
      if (eq) {
        const price = eq?.stats?.price ?? 0;
        return Number(price) || 0;
      }
    }
    return 0;
  }
  const sortedDrops = [...mobDrops].sort((a, b) => {
    if (sortMode === "mesos") {
      return getMesosForDrop(b) - getMesosForDrop(a);
    }
    return b.chance - a.chance;
  });

  // ==================================================
  // GROUPS
  // ==================================================
  const groups = { Equip: [], Use: [], Etc: [], Mesos: [] };

  // ==================================================
  // PROCESS EACH DROP
  // ==================================================
  sortedDrops.forEach((d) => {
    const cleanId = String(d.itemid);
    const padded = cleanId.padStart(8, "0");

    // Base → Final chance
    let baseChance = d.chance / 10000;
    let finalChance = baseChance * dropRateMultiplier;

    // 🚫 REMOVE 0 drop-rate items
    if (finalChance <= 0) return;

    const chance =
      finalChance > 99 ? "100.0" : finalChance.toFixed(2);

    if (d.itemid === 0) {
      const minQ = Number(d.minimum_quantity) || 0;
      const maxQ = Number(d.maximum_quantity) || 0;
      const avg = ((minQ + maxQ) / 2) || 0;
      const chanceText = (() => {
        let baseChance = d.chance / 10000;
        let finalChance = baseChance * dropRateMultiplier;
        return finalChance > 99 ? "100.0" : finalChance.toFixed(2);
      })();
      const qtyForIcon = maxQ || minQ;
      const iconIdx = qtyForIcon >= 1000 ? 4 : qtyForIcon >= 100 ? 3 : qtyForIcon >= 50 ? 2 : 1;
      const imgSrc = withBase(`images/Common/mesos_${iconIdx}.apng`);
      groups.Mesos.push(
        <div key={`meso-${d.id}`} style={{ textAlign: "center" }}>
          <div className="drop-item">
            <img
              className="drop-mesos"
              src={imgSrc}
              alt="Mesos"
              title={`${format(avg)} mesos`}
            />
          </div>
          <div className="text-mute">{d.minimum_quantity} ~ {d.maximum_quantity}</div>
          {showDropRate && <div className="drop-chance-text">{chanceText}%</div>}
        </div>
      );
      return;
    }

    // ------------- EQUIPS ------------------
    let foundEquip = null;
    for (const cat of equipCategories) {
      const eq = cat.find((e) => e.id === padded);
      if (eq) {
        foundEquip = eq;
        break;
      }
    }

    if (foundEquip) {
      const price = Number(foundEquip?.stats?.price) || 0;
      groups.Equip.push(
        <div key={`eq-${foundEquip.id}`} style={{ textAlign: "center" }}>
          {showItemNames ? (
            <div className="drop-item drop-name">{foundEquip.name}</div>
          ) : (
            <img
              className="drop-item"
              src={foundEquip.image}
              title={foundEquip.name}
              onClick={() => navigate(`/equip-detail/${foundEquip.id}`)}
              style={{ cursor: "pointer" }}
            />
          )}
          {showDropRate && <div className="drop-chance-text">{chance} %</div>}
          {showMesos && <div className="drop-chance-text">{format(price)} mesos</div>}
          {showQuantity && (
            <div className="drop-chance-text">
              {d.minimum_quantity} ~ {d.maximum_quantity}
            </div>
          )}
        </div>
      );
      return;
    }

    // ------------- NON-EQUIP ITEMS ------------------
    const item = itemMap[cleanId];
    if (!item) return;

    let groupName = null;
    if (item.category === "Consume") groupName = "Use";
    if (item.category === "Etc") groupName = "Etc";
    if (!groupName) return;

    const price = Number(item?.stats?.price ?? item?.price ?? 0) || 0;
    groups[groupName].push(
      <div key={`it-${item.id}-${d.id}`} style={{ textAlign: "center" }}>
        {showItemNames ? (
          <div className="drop-item drop-name">{getScrollName(item)}</div>
        ) : (
          <img
            className="drop-item"
            src={getScrollImage(item)}
            alt={getScrollName(item)}
            title={getScrollName(item)}
            onClick={() => navigate(`/item/${item.id}`)}
            style={{ cursor: "pointer" }}
          />
        )}
        {showDropRate && <div className="drop-chance-text">{chance}%</div>}
        {showMesos && <div className="drop-chance-text">{format(price)} mesos</div>}
        {showQuantity && (
          <div className="drop-chance-text">
            {d.minimum_quantity} ~ {d.maximum_quantity}
          </div>
        )}
      </div>
    );
  });

  // ==================================================
  // EMPTY LOGIC
  // ==================================================
  const noDrops =
    groups.Equip.length === 0 &&
    groups.Use.length === 0 &&
    groups.Etc.length === 0 &&
    groups.Mesos.length === 0;

  const dropSections = Object.entries(groups).map(([label, arr]) => {
    let emptyText =
      label === "Equip"
        ? "Does not drop any equips."
        : label === "Use"
        ? "Does not drop any items."
        : label === "Etc"
        ? "Does not drop any etc."
        : "Does not drop mesos.";

    return (
      <React.Fragment key={label}>
        <div className="drop-group-title">{label}:</div>
        <div className="drop-group">
          {arr.length > 0 ? arr : <p className="text-mute">{emptyText}</p>}
        </div>
      </React.Fragment>
    );
  });

  // LEVEL IMAGE
  /** Render level digits using image sprites */
  function renderLevelImages(level) {
    if (!level) return null;
    const digits = String(level).split("");

    return (
      <div className="level-img-container">
        {digits.map((d, i) => (
          <img
            key={i}
            src={withBase(`images/Level/${d}.png`)}
            alt={d}
            className="level-digit"
          />
        ))}
      </div>
    );
  }

  const eleGroups = getElementGroups(mob.elemAttr);

  /** Render elemental icons for a list */
  function renderEleIcons(arr) {
    if (!arr || arr.length === 0) {
      return <span className="stat-attack">-</span>;
    }
    return arr.map((name, idx) => (
      <img
        key={idx}
        className="stat-attack ele-icon"
        src={withBase(`images/Common/${name}_ele.png`)}
        alt={name}
        title={name}
      />
    ));
  }

  /** Render undead status icon */
  function renderUndead(value) {
    const name = value == 1 ? "undead" : "-";
    if (name === "-") return <span className="stat-attack">-</span>;
    return (
      <img
        className="stat-attack ele-icon"
        src={withBase(`images/Common/${name}_ele.png`)}
        alt={name}
        title={name}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="panel" id="monsterPanel">
        <p className="header-title">Monster Details</p>

        <div className="detail-container">
          <div className="left-detail-container">
            <div>
              <div className="image-card">
                <img src={mob.img} alt={mob.name} />
              </div>
            </div>

            <div>
              <div className="stats-container">
                <div className="stat-row stat-leader">
                  <div className="stat-label">LVL:</div>
                  <div>{renderLevelImages(mob.level)}</div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">HP:</div>
                  <div className="stat-bar">
                    <div className="stat-fill hp-bar" />
                    <div className="stat-text">{format(mob.maxHP)}</div>
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">MP:</div>
                  <div className="stat-bar">
                    <div className="stat-fill mp-bar" />
                    <div className="stat-text">{format(mob.maxMP)}</div>
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">EXP:</div>
                  <div className="stat-bar">
                    <div className="stat-fill exp-bar" />
                    <div className="stat-text">{format(mob.exp)}</div>
                  </div>
                </div>

                <div className="stat-row stat-leader">
                  <div className="stat-label">W. Attack:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.PADamage)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">M. Attack:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.MADamage)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">W. Defense:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.PDDamage)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">M. Defense:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.MDDamage)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">Accuracy:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.acc)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">Avoidability:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.eva)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">Speed:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.speed)}
                  </div>
                </div>

                <div className="stat-row">
                  <div className="stat-label">Knockback:</div>
                  <div className="text-mute stat-attack">
                    {format(mob.pushed)}
                  </div>
                </div>

                <div className="stat-row stat-leader">
                  <div className="stat-label">Immune:</div>
                  {renderEleIcons(eleGroups.immune)}
                </div>

                <div className="stat-row">
                  <div className="stat-label">Strong:</div>
                  {renderEleIcons(eleGroups.strong)}
                </div>

                <div className="stat-row">
                  <div className="stat-label">Weak:</div>
                  {renderEleIcons(eleGroups.weak)}
                </div>

                <div className="stat-row">
                  <div className="stat-label">Undead:</div>
                  <div className="text-mute stat-attack">
                    {renderUndead(mob.undead)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-detail-container">
            <p className="mob-name">{mob.name}</p>
            <p className="mob-drop">Drops</p>
            <div className="drop-utils-container">
              <div className="drop-utils">
                Sort: <select className="drop-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                  <option value="chance">Drop rate</option>
                  <option value="mesos">Npc price</option>
                </select>
              </div>
              <div className="drop-utils">
                Show: 
                <label>
                  <input type="checkbox" checked={showDropRate} onChange={(e) => setShowDropRate(e.target.checked)} />Drop rate
                </label>
                <label>
                  <input type="checkbox" checked={showMesos} onChange={(e) => setShowMesos(e.target.checked)} />Npc price
                </label>
                <label>
                  <input type="checkbox" checked={showQuantity} onChange={(e) => setShowQuantity(e.target.checked)} />Quantity
                </label>
              </div>
              <div className="drop-utils">
                Visible: 
                <label>
                  <input type="checkbox" checked={showItemNames} onChange={(e) => setShowItemNames(e.target.checked)} />Name
                </label>
              </div>
            </div>
            {noDrops ? (
              <p className="text-mute">No drops found.</p>
            ) : (
              dropSections
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

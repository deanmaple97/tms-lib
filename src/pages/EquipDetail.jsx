// src/pages/EquipDetail.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadEquips, loadDrops, loadAllMobs } from "../data";
import { CATEGORY_LABELS, getJobAllowed, getAttackSpeedLabel, getEquipType, MOB_TYPE_DROP_RATE, getFormattedNumber } from "../utils";

/** Render a single stat line if value is non-zero */
function statLine(label, value) {
  if (value == null || value === 0) return null;
  const sign = value > 0 ? "+" : "";
  return (
    <div className="ms-equip-line" key={label}>
      <span className="ms-equip-stat-label">{label}</span>
      <span className="ms-equip-stat-value">
        {sign}
        {value}
      </span>
    </div>
  );
}

/** Render a requirement cell for equip requirements */
function ReqCell({ label, value }) {
  return (
    <div className="ms-req-cell">
      <span className="ms-req-label">{label}</span>
      <span className="ms-req-value">{value ?? 0}</span>
    </div>
  );
}

// helpers moved to utils/equip.js

/** Equip details page */
export default function EquipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [allEquips, setAllEquips] = useState([]);
  const [drops, setDrops] = useState([]);
  const [mobMap, setMobMap] = useState({});
  const [loading, setLoading] = useState(true);

  /** Load equips, drops, and mobs */
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [{ equipCategories }, dropsData, { mobMap }] = await Promise.all([
          loadEquips(),
          loadDrops(),
          loadAllMobs(),
        ]);

        if (cancelled) return;
        setAllEquips(equipCategories.flat());
        setDrops(dropsData);
        setMobMap(mobMap);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);
  /** Find the target equip by id */
  const equip = useMemo(
    () => allEquips.find((e) => e.id === id),
    [allEquips, id]
  );

  if (loading) {
    return (
      <div className="page-container">
        <p className="mob-name">Loading equip...</p>
      </div>
    );
  }

  if (!equip) {
    return (
      <div className="page-container">
        <p className="mob-name">Equip Not Found</p>
      </div>
    );
  }

  const stats = equip.stats || {};

  const itemIdClean = Number(equip.id);
  const droppers = drops.filter(
    (d) => String(d.itemid) === String(itemIdClean)
  );

  const dropCards = droppers
    .map((d) => {
      const mob = mobMap[String(d.dropperid)];
      if (!mob) return null;
      if (d.chance <= 0) return null;

      const dropRateMultiplier =
        mob.boss == 1 ? MOB_TYPE_DROP_RATE.boss : MOB_TYPE_DROP_RATE.normal;

      const chance = (d.chance / 10000) * dropRateMultiplier;
      const { minimum_quantity, maximum_quantity } = d;

      return (
        <div
          key={d.id}
          className="drop-card"
          onClick={() => navigate(`/monster/${mob.id}`, { state: { returnTo: `${location.pathname}${location.search}` } })}
        >
          <img src={mob.img} alt={mob.name} title={mob.name} className="drop-mob" />
          <div className="text-mute">
            <div className="drop-chance-text">
              {chance > 99 ? "100" : chance.toFixed(2)}%
            </div>
            <div className="drop-chance-text">
              {minimum_quantity} ~ {maximum_quantity}
            </div>
          </div>
        </div>
      );
    })
    .filter(Boolean);   // 🔥 remove null results

  const desc = equip.desc || "";
  const descLines = desc
    .split("\n")
    .filter((line) => line.trim().length > 0);

  return (
    <div className="page-container">
      <div className="panel" id="equipPanel">
        <p className="header-title">
          {CATEGORY_LABELS[equip.category] || equip.category} Information
        </p>

        <div className="flex-detail">
          <div className="image-card">
            <img src={equip.image} alt={equip.name} className="float-anim"/>
          </div>

          <div className="flex-1">
            <div className="ms-equip-box">
              <p className="equip-name">{equip.name}</p>

              <div className="ms-req-row">
                <ReqCell label="REQ LEV" value={stats.reqLevel} />
                <ReqCell label="REQ STR" value={stats.reqSTR} />
                <ReqCell label="REQ DEX" value={stats.reqDEX} />
                <ReqCell label="REQ INT" value={stats.reqINT} />
                <ReqCell label="REQ LUK" value={stats.reqLUK} />
              </div>

              {descLines.length > 0 && (
                <div className="ms-equip-desc">
                  {descLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              )}

              <div className="equip-job-req">
                <div className="job-row">
                  {[
                    "Beginner",
                    "Warrior",
                    "Magician",
                    "Bowman",
                    "Thief",
                    "Pirate",
                  ].map((job) => {
                    const allowed = getJobAllowed(stats.reqJob, job);
                    return (
                      <div
                        key={job}
                        className={`job-col ${
                          allowed ? "job-allowed" : "job-blocked"
                        }`}
                      >
                        <div className="job-label">{job}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ms-equip-stats">
                {getEquipType(equip.id) && (
                  <span className="ms-equip-type">
                    CATEGORY: {getEquipType(equip.id)}
                  </span>
                )}

                {stats.attackSpeed != null && (
                  <div className="ms-equip-line">
                    <span className="ms-equip-stat-label">ATTACK SPEED:</span>
                    <span className="ms-equip-stat-value">
                      {getAttackSpeedLabel(stats.attackSpeed)} ({stats.attackSpeed})
                    </span>
                  </div>
                )}

                {statLine("STR:", stats.incSTR)}
                {statLine("DEX:", stats.incDEX)}
                {statLine("INT:", stats.incINT)}
                {statLine("LUK:", stats.incLUK)}

                {statLine("MaxHP:", stats.incHP)}
                {statLine("MaxMP:", stats.incMP)}

                {statLine("WEAPON ATTACK:", stats.incPAD)}
                {statLine("MAGIC ATTACK:", stats.incMAD)}

                {statLine("WEAPON DEF:", stats.incPDD)}
                {statLine("MAGIC DEF:", stats.incMDD)}

                {statLine("ACCURACY:", stats.incACC)}
                {statLine("AVOIDABILITY:", stats.incEVA)}

                {statLine("SPEED:", stats.incSpeed)}
                {statLine("JUMP:", stats.incJump)}
              </div>

              <div className="ms-equip-footer">
                {stats.tuc != null && (
                  <div className="ms-equip-line">
                    <span className="ms-equip-stat-label">
                      NUMBERS OF UPGRADES AVAILABLE:
                    </span>
                    <span className="ms-equip-stat-value">{stats.tuc}</span>
                  </div>
                )}
              </div>
              
              <div className="ms-equip-footer">
                {stats.price != null && (
                  <div className="ms-equip-price">
                    <span className="ms-equip-stat-value">Sell for {getFormattedNumber(stats.price)} mesos.</span>
                  </div>
                )}
              </div>

            </div>

            <p className="mob-drop">Dropped By</p>

              {dropCards.length === 0 ? (
                <p className="text-mute">No monsters drop this item.</p>
              ) : (
                <div className="item-drop-mob">{dropCards}</div>
              )}

          </div>
        </div>
      </div>
    </div>
  );
}

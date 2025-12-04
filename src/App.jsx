import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import SearchModal from "./components/SearchModal";

import MonstersPage from "./pages/MonstersPage";
import EquipPage from "./pages/EquipPage";
import AccessoryPage from "./pages/AccessoryPage.jsx";
import CapPage from "./pages/CapPage.jsx";
import CoatPage from "./pages/CoatPage.jsx";
import LongcoatPage from "./pages/LongcoatPage.jsx";
import PantsPage from "./pages/PantsPage.jsx";
import GlovePage from "./pages/GlovePage.jsx";
import ShoesPage from "./pages/ShoesPage.jsx";
import ShieldPage from "./pages/ShieldPage.jsx";
import WeaponPage from "./pages/WeaponPage.jsx";
import MonsterDetail from "./pages/MonsterDetail";
import EquipDetail from "./pages/EquipDetail";
import UsePage from "./pages/UsePage";
import EtcPage from "./pages/EtcPage";
import SetupPage from "./pages/SetupPage";
import ItemDetail from "./pages/ItemDetail";

import { getScrollImage } from "./utils";

import {
  loadAllMobs,
  loadAllItems,
  loadEquips
} from "./data";

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // ⭐ Global data store
  const [mobList, setMobList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [equipList, setEquipList] = useState([]);

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ⭐ Load everything ONCE when app starts
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [{ mobs }, { items }, { flatEquips }] = await Promise.all([
          loadAllMobs(),
          loadAllItems(),
          loadEquips()
        ]);

        if (cancelled) return;

        setMobList(mobs);
        setItemList(items);
        setEquipList(flatEquips);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // ⭐ SEARCH HANDLER (now uses loaded data)
  function handleGlobalSearch(query) {
    const q = query.toLowerCase();

    // search mobs
    const mobMatches = mobList
      .filter(m => m.name.toLowerCase().includes(q))
      .map(m => ({
        category: m.boss == 1 ? "Boss" : "Monster",
        id: m.id,
        name: m.name,
        image: m.img,
        link: `/monster/${m.id}`,
      }));

    // search items
    const itemMatches = itemList
      .filter(it => it.name.toLowerCase().includes(q))
      .map(it => ({
        category: it.category == "Consume" ? "Use" : it.category,
        id: it.id,
        name: it.name,
        image: getScrollImage(it),
        link: `/item/${it.id}`,
        stats: it.stats
      }));

    // search equips
    const equipMatches = equipList
      .filter(e => e.name.toLowerCase().includes(q))
      .map(e => ({
        category: e.category,
        id: e.id,
        name: e.name,
        image: e.image,
        link: `/equip-detail/${e.id}`,
      }));

    const combined = [...mobMatches, ...itemMatches, ...equipMatches];

    setSearchResults(combined);
    setSearchOpen(true);
  }

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading Library...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar onSearch={handleGlobalSearch} />

      <div className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/monsters" replace />} />

          <Route path="/monsters" element={<MonstersPage />} />
          <Route path="/monster/:id" element={<MonsterDetail />} />

          <Route path="/use" element={<UsePage />} />
          <Route path="/etc" element={<EtcPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/item/:id" element={<ItemDetail />} />

          {/* Specific equip category pages */}
          <Route path="/equip/Accessory" element={<AccessoryPage />} />
          <Route path="/equip/Cap" element={<CapPage />} />
          <Route path="/equip/Coat" element={<CoatPage />} />
          <Route path="/equip/Longcoat" element={<LongcoatPage />} />
          <Route path="/equip/Pants" element={<PantsPage />} />
          <Route path="/equip/Glove" element={<GlovePage />} />
          <Route path="/equip/Shoes" element={<ShoesPage />} />
          <Route path="/equip/Shield" element={<ShieldPage />} />
          <Route path="/equip/Weapon" element={<WeaponPage />} />

          {/* Fallback dynamic route */}
          <Route path="/equip/:category" element={<EquipPage />} />
          <Route path="/equip-detail/:id" element={<EquipDetail />} />

          <Route path="*" element={<Navigate to="/monsters" replace />} />
        </Routes>
      </div>

      <SearchModal
        open={searchOpen}
        results={searchResults}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

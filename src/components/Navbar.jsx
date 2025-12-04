// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { CATEGORY_LABELS, getPaginationState, withBase } from "../utils";
import { ACCESSORY_TYPE_ORDER } from "../utils/accessoryId.js";
import { WEAPON_TYPE_ORDER } from "../utils/weaponId.js";

export default function Navbar({ onSearch, widgetDocked, onResumeWidget, onAddBookmark, onOpenBookmarks }) {
  const widgetRef = useRef(null);
  const [widgetActive, setWidgetActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const equipCategories = [
    "Weapon",
    "Accessory",
    "Cap",
    "Coat",
    "Longcoat",
    "Pants",
    "Glove",
    "Shoes",
    "Shield",
  ];

  const isEquipActive = location.pathname.startsWith("/equip");

  useEffect(() => {
    const navbar = document.getElementById("navbarCollapse");
    if (navbar && window.bootstrap) {
      new window.bootstrap.Collapse(navbar, { toggle: false });
    }
  }, []);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;
    const onShow = () => setWidgetActive(true);
    const onHide = () => setWidgetActive(false);
    el.addEventListener("show.bs.dropdown", onShow);
    el.addEventListener("hide.bs.dropdown", onHide);
    return () => {
      el.removeEventListener("show.bs.dropdown", onShow);
      el.removeEventListener("hide.bs.dropdown", onHide);
    };
  }, [widgetRef]);

  function closeNavbar() {
    const navbar = document.getElementById("navbarCollapse");
    if (!navbar || !window.bootstrap) return;

    let bsCollapse = window.bootstrap.Collapse.getInstance(navbar);
    if (!bsCollapse) {
      bsCollapse = new window.bootstrap.Collapse(navbar, { toggle: false });
    }
    bsCollapse.hide();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (!query) return;

    if (typeof onSearch === "function") onSearch(query);
    closeNavbar();
  }

  return (
    <nav className="navbar navbar-expand-lg timeless-navbar">
      <div className="container-fluid nav-container">

        {/* LOGO */}
        <div className="nav-logo-wrapper">
          <img
            src={withBase("images/Common/logo.png")}
            alt="logo"
            className="nav-logo-img"
          />
          <span className="navbar-brand timeless-logo">
            TMS Library
          </span>
        </div>

        {/* TOGGLER */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU CONTENT */}
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <NavLink
                to={getNavTo("/monsters")}
                onClick={closeNavbar}
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Monsters
              </NavLink>
            </li>

            {/* ITEMS DROPDOWN */}
            <li className="nav-item dropdown">
              <button
                className={
                  "nav-link dropdown-toggle" +
                  (location.pathname.startsWith("/use") ||
                  location.pathname.startsWith("/etc") ||
                  location.pathname.startsWith("/setup")
                    ? " active"
                    : "")
                }
                data-bs-toggle="dropdown"
              >
                Items
              </button>

              <ul className="dropdown-menu timeless-dropdown">

                <li>
                  <NavLink
                    to={getNavTo("/use")}
                    onClick={closeNavbar}
                    className={({ isActive }) =>
                      "dropdown-item" + (isActive ? " active" : "")
                    }
                  >
                    Use
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to={getNavTo("/etc")}
                    onClick={closeNavbar}
                    className={({ isActive }) =>
                      "dropdown-item" + (isActive ? " active" : "")
                    }
                  >
                    Etc
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to={getNavTo("/setup")}
                    onClick={closeNavbar}
                    className={({ isActive }) =>
                      "dropdown-item" + (isActive ? " active" : "")
                    }
                  >
                    Setup
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* EQUIPS DROPDOWN */}
            <li className="nav-item dropdown">
              <button
                className={
                  "nav-link dropdown-toggle" + (isEquipActive ? " active" : "")
                }
                data-bs-toggle="dropdown"
              >
                Equips
              </button>

              <ul className="dropdown-menu timeless-dropdown">
                {equipCategories.map((cat) => (
                  cat === "Accessory" ? (
                    <li key={cat} className="dropend">
                      <button className="dropdown-item dropdown-toggle">
                        {CATEGORY_LABELS[cat] || cat}
                      </button>
                      <ul className="dropdown-menu timeless-dropdown">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              const saved = getPaginationState(`/equip/${cat}`) || { page: 1, size: 100 };
                              navigate({ pathname: `/equip/${cat}`, search: `?page=1&size=${saved.size}` });
                              closeNavbar();
                            }}
                          >
                            All
                          </button>
                        </li>
                        {ACCESSORY_TYPE_ORDER.map((name) => (
                          <li key={name}>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                const saved = getPaginationState(`/equip/${cat}`) || { page: 1, size: 100 };
                                navigate({ pathname: `/equip/${cat}`, search: `?page=1&size=${saved.size}&type=${encodeURIComponent(name)}` });
                                closeNavbar();
                              }}
                            >
                              {name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : cat === "Weapon" ? (
                     <li key={cat} className="dropend">
                       <button className="dropdown-item dropdown-toggle">
                         {CATEGORY_LABELS[cat] || cat}
                       </button>
                       <ul className="dropdown-menu timeless-dropdown">
                         <li>
                           <button
                             className="dropdown-item"
                             onClick={() => {
                               const saved = getPaginationState(`/equip/${cat}`) || { page: 1, size: 100 };
                               navigate({ pathname: `/equip/${cat}`, search: `?page=1&size=${saved.size}` });
                               closeNavbar();
                             }}
                           >
                             All
                           </button>
                         </li>
                         {WEAPON_TYPE_ORDER.map((name) => (
                           <li key={name}>
                             <button
                               className="dropdown-item"
                               onClick={() => {
                                 const saved = getPaginationState(`/equip/${cat}`) || { page: 1, size: 100 };
                                 navigate({ pathname: `/equip/${cat}`, search: `?page=1&size=${saved.size}&type=${encodeURIComponent(name)}` });
                                 closeNavbar();
                               }}
                             >
                               {name}
                             </button>
                           </li>
                         ))}
                       </ul>
                     </li>
                   ) : (
                     <li key={cat}>
                       <NavLink
                         to={getNavTo(`/equip/${encodeURIComponent(cat)}`)}
                         onClick={closeNavbar}
                         className={({ isActive }) =>
                           "dropdown-item" + (isActive ? " active" : "")
                         }
                       >
                         {CATEGORY_LABELS[cat] || cat}
                       </NavLink>
                     </li>
                   )
                ))}
              </ul>
            </li>
          </ul>

          {/* DOCKED WIDGET DROPDOWN */}
          {widgetDocked && (
            <div ref={widgetRef} className="dropdown me-2 nav-docked-widget">
              <button
                className="btn p-0 nav-docked-widget-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title="Widget"
                onFocus={() => setWidgetActive(true)}
                onBlur={() => setWidgetActive(false)}
              >
                <img
                  src={withBase(widgetActive ? "images/Common/widget.gif" : "images/Common/widget.png")}
                  alt="Widget"
                  className="nav-docked-widget-img"
                />
              </button>
              <ul className="dropdown-menu timeless-dropdown">
                <li>
                  <button className="dropdown-item" onClick={onAddBookmark}>
                    Add bookmark
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={onOpenBookmarks}>
                    Bookmarks
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={onResumeWidget}>
                    Resume widget
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* SEARCH BAR */}
          <form className="d-flex mb-lg-0 mb-2" onSubmit={handleSubmit}>
            <input
              name="search"
              className="form-control timeless-input"
              type="search"
              placeholder="Search..."
            />
            <button className="btn timeless-search-btn" type="submit">
              🔍
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
  function getNavTo(path) {
    const saved = getPaginationState(path);
    if (!saved) return path;
    return { pathname: path, search: `?page=${saved.page}&size=${saved.size}` };
  }
  

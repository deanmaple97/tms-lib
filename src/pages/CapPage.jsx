import React from "react";
import EquipListPage from "../components/EquipListPage.jsx";
import { CATEGORY_LABELS } from "../utils";

/** Cap equips page */
export default function CapPage() {
  const category = "Cap";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}
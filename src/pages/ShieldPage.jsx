import React from "react";
import EquipListPage from "../components/EquipListPage.jsx";
import { CATEGORY_LABELS } from "../utils";

/** Shield equips page */
export default function ShieldPage() {
  const category = "Shield";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}
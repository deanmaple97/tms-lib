import React from "react";
import EquipListPage from "../components/EquipListPage.jsx";
import { CATEGORY_LABELS } from "../utils";

/** Coat equips page */
export default function CoatPage() {
  const category = "Coat";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}
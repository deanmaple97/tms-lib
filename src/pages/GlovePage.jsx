import React from "react";
import EquipListPage from "../components/EquipListPage.jsx";
import { CATEGORY_LABELS } from "../utils";

/** Glove equips page */
export default function GlovePage() {
  const category = "Glove";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}
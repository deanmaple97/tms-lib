import React from "react";
import EquipListPage from "../components/EquipListPage.jsx";
import { CATEGORY_LABELS } from "../utils";

/** Ring equips page */
export default function RingPage() {
  const category = "Ring";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}
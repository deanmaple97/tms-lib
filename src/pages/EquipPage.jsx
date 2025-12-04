// src/pages/EquipPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { CATEGORY_LABELS } from "../utils";
import EquipListPage from "../components/EquipListPage.jsx";

/** Equip page wrapper that renders the reusable EquipListPage */
export default function EquipPage() {
  let { category } = useParams();
  if (category === "Ring") category = "Accessory";
  const title = `Equips - ${CATEGORY_LABELS[category] || category}`;
  return <EquipListPage category={category} title={title} />;
}

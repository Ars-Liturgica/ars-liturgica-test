import React from "react";
import BachecaAvvisi from "./stanze/BachecaAvvisi/BachecaAvvisi";

export default function DashboardFedele() {
  const parrocchia = {
    id: localStorage.getItem("ars_parrocchia_id"),
    nome:
      localStorage.getItem("ars_nome_parrocchia") ||
      "La tua Parrocchia",
  };

  return (
    <div>
      <BachecaAvvisi
        parrocchia={parrocchia}
        solaLettura={true}
      />
    </div>
  );
}

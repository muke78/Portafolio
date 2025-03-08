import type { TabHabilidades } from "@/types/typesTabsHabilidades";

export const tabs: TabHabilidades[] = [
  {
    id: "interfaz-tab",
    title: "Interfaz",
    target: "#styled-interfaz",
    ariaControls: "interfaz",
  },
  {
    id: "logica-tab",
    title: "Lógica",
    target: "#styled-logica",
    ariaControls: "logica",
  },
  {
    id: "otros-tab",
    title: "Otros",
    target: "#styled-otros",
    ariaControls: "otros",
  },
];

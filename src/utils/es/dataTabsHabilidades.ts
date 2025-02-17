import type { Tab } from "@/types/typesHabilidades";

export const tabs: Tab[] = [
  {
    id: "interfaz-tab",
    title: "Interfaz",
    target: "#styled-interfaz",
    ariaControls: "interfaz",
  },
  {
    id: "logica-tab",
    title: "Logica",
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

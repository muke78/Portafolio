import type { Tab } from "@/types/typesHabilidades";

export const tabs: Tab[] = [
  {
    id: "profile-styled-tab",
    title: "Interfaz",
    target: "#styled-profile",
    ariaControls: "profile",
  },
  {
    id: "dashboard-styled-tab",
    title: "Logica",
    target: "#styled-dashboard",
    ariaControls: "dashboard",
  },
  {
    id: "settings-styled-tab",
    title: "Otros",
    target: "#styled-settings",
    ariaControls: "settings",
  },
];

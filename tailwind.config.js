import daisyui from "daisyui";
import flowbite from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/flowbite/**/*.js",
  ],
  // add daisyUI plugin
  plugins: [daisyui, flowbite],

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ["dark", "nord"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};

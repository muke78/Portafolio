import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/flowbite/**/*.js",
  ],
  // add daisyUI plugin
  plugins: [daisyui],

  // daisyUI config (optional - here are the default values)
  daisyui: {
    themes: ["night", "nord"],
    darkTheme: "night",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};

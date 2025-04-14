import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  plugins: [daisyui],

  // daisyUI config (optional - here are the default values)
  // daisyui: {
  //   themes: ["night", "nord"],
  //   darkTheme: "night",
  //   base: true,
  //   styled: true,
  //   utils: true,
  //   prefix: "",
  //   logs: true,
  //   themeRoot: ":root",
  // },
};

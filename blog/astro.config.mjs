import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://nickpalenchar.com",
  integrations: [tailwind(), icon()],
  output: "static",
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});

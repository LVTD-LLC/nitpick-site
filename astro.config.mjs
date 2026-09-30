// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://nitpick.sh",
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
});

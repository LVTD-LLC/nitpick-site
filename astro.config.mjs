// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://nitpick.cr.lvtd.dev",
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
});

import { defineConfig } from "astro/config";

// Emit About.astro as About.html (not About/index.html) so every existing
// URL, canonical link and search-engine entry keeps working unchanged.
export default defineConfig({
  site: "https://iel.net.pk",
  output: "static",
  trailingSlash: "ignore",
  build: { format: "file" },
});

import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };

  return {
    define: {
      process: {
        env: {},
      },
    },
    // no Remix Vite plugin here
    plugins: [tsconfigPaths()],
  };
});

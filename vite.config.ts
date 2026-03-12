// import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
// import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    tanstackStart(),
    // https://tanstack.com/start/latest/docs/framework/react/guide/hosting
    nitro(),
    // viteReact(),
    // // https://npmx.dev/package/@vitejs/plugin-react#user-content-react-compiler
    // babel({
    //   presets: [reactCompilerPreset()],
    // }),
    // issue for @vitejs/plugin-react 6.0: https://github.com/rolldown/plugins/issues/10
    viteReact({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              target: "19",
            },
          ],
        ],
      },
    }),
    tailwindcss(),
  ],
});

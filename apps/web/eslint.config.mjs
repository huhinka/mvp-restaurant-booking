import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["apps/web/**/*.ts"],
    extends: ["next/core-web-vitals"],
  },
]);

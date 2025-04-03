import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"] },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // 指定适用的文件类型
    plugins: {
      import: eslintPluginImport, // 启用 import 插件
    },
    rules: {
      // 强制导入模块时必须带上文件后缀
      "import/extensions": [
        "error", // 将规则设置为错误级别
        "always", // 始终要求文件后缀
        {
          js: "always", // 对于 .js 文件，强制要求后缀
          jsx: "always", // 对于 .jsx 文件，强制要求后缀
          ts: "always", // 对于 .ts 文件，强制要求后缀
          tsx: "always", // 对于 .tsx 文件，强制要求后缀
        },
      ],
    },
  },
]);

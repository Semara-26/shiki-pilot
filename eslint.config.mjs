import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules — pencegahan bug jangka panjang
  {
    rules: {
      // Cegah variable shadowing (deklarasi ulang nama variabel di scope dalam)
      // Bug yang ditemukan: `const dbData` di dalam blok updateStock
      // men-shadow `let dbData` di scope luar, menyebabkan alur kontrol salah.
      "no-shadow": "error",
    },
  },
]);

export default eslintConfig;

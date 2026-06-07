import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cpf.ts",
    "src/cnpj.ts",
    "src/cep.ts",
    "src/phone.ts",
    "src/currency.ts",
    "src/dates.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: false,
  target: "es2020",
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});

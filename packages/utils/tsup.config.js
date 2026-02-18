import { defineConfig } from "tsup";
import config from "@food-trek/tsup-config";

export default defineConfig({
  ...config,
  dts: true,
  entry: ["src/index.ts"],
});

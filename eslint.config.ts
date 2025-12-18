import { defineConfig } from "eslint/config";
import { sheriff, type SheriffSettings } from "eslint-config-sheriff";

const sheriffOptions: SheriffSettings = {
  react: true,
  lodash: false,
  remeda: false,
  next: false,
  astro: false,
  playwright: false,
  storybook: true,
  jest: false,
  vitest: false,
  tsconfigRootDir: import.meta.dirname,
};

export default defineConfig(sheriff(sheriffOptions), {
  rules: {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "jsx-a11y/media-has-caption": "off",
    "react/no-array-index-key": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@regru/prefer-early-return/prefer-early-return": "off",
    "no-negated-condition": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "fsecond/no-inline-interfaces": "off",
    "fsecond/valid-event-listener": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
  },
});

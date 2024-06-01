import catchErrorDecorator from "./catch-error-decorator";
import type { Rule } from "eslint";

const rules: Record<string, Rule.RuleModule> = {
  "catch-error-decorator": catchErrorDecorator,
};

export default rules;

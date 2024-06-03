import ts from "typescript";
import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { containsAllTypesByName } from "@typescript-eslint/type-utils";
import type { Rule } from "eslint";

const promiseNameSet = new Set(["Promise"]);

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "force explicit type 'T' for CatchError decorator if not rethrow",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      Decorator(x: Rule.Node): void {
        const services = ESLintUtils.getParserServices(context as any);

        const node = x as unknown as TSESTree.Decorator;
        if (node.expression.type !== TSESTree.AST_NODE_TYPES.CallExpression) return;
        if (node.expression.callee.type !== TSESTree.AST_NODE_TYPES.Identifier) return;

        if (node.expression.callee.name === "CatchError") {
          const secondArgument = node.expression.arguments[1];
          // if is undefined or false
          const sldCheck =
            !secondArgument ||
            (secondArgument.type === TSESTree.AST_NODE_TYPES.Literal && secondArgument.value === false);
          if (!sldCheck) return;

          const firstArgument = node.expression.arguments[0];
          if (!firstArgument) return;

          // check if there is a type argument
          const typeArgument = node.expression.typeParameters?.params[0];
          if (!typeArgument) {
            const message = "Explicit type 'T' must be provided for CatchError decorator";
            context.report({ node: x, message });
            return;
          }

          const parentNode = node.parent;
          if (parentNode.type !== TSESTree.AST_NODE_TYPES.MethodDefinition) return;

          const checker = services.program.getTypeChecker();
          const methodNode: TSESTree.MethodDefinition = parentNode;
          const methodTsNode = services.esTreeNodeToTSNodeMap.get(methodNode);
          const signature = checker.getSignatureFromDeclaration(methodTsNode);
          if (!signature) return;
          const returnType = checker.getReturnTypeOfSignature(signature);

          const typeArgumentTsNode = services.esTreeNodeToTSNodeMap.get(typeArgument);
          const explicitType = checker.getTypeAtLocation(typeArgumentTsNode);

          // @ts-ignore method not exposed
          if (checker.isTypeAssignableTo(explicitType, returnType)) return;

          // check if returnType is a Promise
          if (containsAllTypesByName(returnType, false, promiseNameSet)) {
            const promiseType: ts.TypeReference = returnType as ts.TypeReference;
            const promiseTypeArgument = promiseType.typeArguments?.[0];
            if (!promiseTypeArgument) return;
            // @ts-ignore method not exposed
            if (checker.isTypeAssignableTo(explicitType, promiseTypeArgument)) return;
            context.report({
              node: x,
              message: `Type '${checker.typeToString(explicitType)}' is not assignable to type '${checker.typeToString(promiseTypeArgument)}'`,
            });
          }
        }
      },
    };
  },
};

export default rule;

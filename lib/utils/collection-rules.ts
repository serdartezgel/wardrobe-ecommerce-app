import { CollectionType, Prisma } from "../generated/prisma";

export type RuleOperator =
  | "equals"
  | "contains"
  | "in"
  | "gt"
  | "gte"
  | "lt"
  | "has"
  | "exists";

export type RuleField = "tags" | "createdAt" | "variantDiscount";

export type RuleCondition = {
  field: RuleField;
  operator: RuleOperator;
  value: unknown;
};

export type Rules = {
  conditions: RuleCondition[];
};

export function inferSeason(date: Date) {
  const month = date.getMonth() + 1;

  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  return "autumn";
}

function resolveDateMacro(value: unknown): Date | null {
  if (value === "NOW_MINUS_30_DAYS") {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function generateRulesByType(type: CollectionType): string | null {
  switch (type) {
    case "SEASONAL":
      return JSON.stringify({
        conditions: [
          {
            field: "tags",
            operator: "has",
            value: inferSeason(new Date()),
          },
        ],
      });

    case "DEAL":
      return JSON.stringify({
        conditions: [
          {
            field: "variantDiscount",
            operator: "exists",
            value: true,
          },
        ],
      });

    case "NEW_ARRIVAL":
      return JSON.stringify({
        conditions: [
          {
            field: "createdAt",
            operator: "gte",
            value: "NOW_MINUS_30_DAYS",
          },
        ],
      });

    case "BESTSELLER":
      return null;

    default:
      return null;
  }
}

export function buildProductWhereFromRules(
  rulesJson: string,
): Prisma.ProductWhereInput {
  const rules = JSON.parse(rulesJson) as Rules;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  for (const condition of rules.conditions) {
    switch (condition.field) {
      case "tags":
        if (condition.operator === "has") {
          where.tags = {
            has: String(condition.value).toLowerCase(),
          };
        }
        break;

      case "createdAt": {
        const date = resolveDateMacro(condition.value);
        if (date && condition.operator === "gte") {
          where.createdAt = { gte: date };
        }
        break;
      }

      case "variantDiscount":
        if (condition.operator === "exists") {
          where.variants = {
            some: {
              compareAtPriceCents: { not: null },
            },
          };
        }
        break;
    }
  }

  return where;
}

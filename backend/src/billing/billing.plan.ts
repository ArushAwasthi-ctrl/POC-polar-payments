export type PlanId = "pro" | "master";

export function isValidPlan(plan: string): plan is PlanId {
  return plan === "pro" || plan === "master";
}

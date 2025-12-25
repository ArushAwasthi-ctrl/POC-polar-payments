import type { Context } from "hono";
import { polar } from "../billing/polar.client.js";
import { isValidPlan, type PlanId } from "../billing/billing.plan.js";

const getProductId = (planId: PlanId): string => {
  const productId =
    planId === "pro"
      ? process.env.POLAR_PRO_PRODUCT_ID
      : process.env.POLAR_MASTER_PRODUCT_ID;

  if (!productId) {
    throw new Error(`Missing product ID for plan: ${planId}`);
  }

  return productId;
};

export const billingRpc = {
  async createCheckout(c: Context) {
    const body = await c.req.json();
    const planId = body?.planId;

    if (!isValidPlan(planId)) {
      return c.json({ error: "Invalid plan selected" }, 400);
    }

    const productId = getProductId(planId);
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Hardcoded for POC - no authentication
    const customerId = "poc_user_001";

    const session = await polar.checkouts.create({
      products: [productId],
      externalCustomerId: customerId,
      successUrl: `${baseUrl}/success`,
      returnUrl: baseUrl,
    });

    return c.json({ url: session.url });
  },
};
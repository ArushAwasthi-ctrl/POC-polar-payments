// src/billing/billing.service.ts
// ===============================
// This is the "business logic" layer for billing.
//
// WHY SEPARATE THIS FROM WEBHOOKS?
// --------------------------------
// 1. Separation of concerns: Webhooks handle HTTP, this handles business logic
// 2. Testability: You can test this without mocking HTTP
// 3. Reusability: Other parts of your app can call these functions
//
// IN A REAL APP, THIS WOULD:
// - Update a database (e.g., user.subscription_status = 'active')
// - Enable/disable feature flags
// - Send emails or notifications
// - Sync with other services
//
// FOR THIS POC:
// - We just log to console
// - This shows WHERE database calls would go

/**
 * Called when a subscription becomes active.
 * This is THE moment to grant the user access to paid features.
 *
 * @param customerId - The Polar customer ID (maps to your user)
 */
export function onSubscriptionActive(customerId: string): void {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║  🎉 SUBSCRIPTION ACTIVATED                 ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  Customer: ${customerId.padEnd(30)}║`);
  console.log("║                                            ║");
  console.log("║  TODO in production:                       ║");
  console.log("║  • db.users.update({ polarId }, { pro })   ║");
  console.log("║  • Enable premium features                 ║");
  console.log("║  • Send welcome email                      ║");
  console.log("╚════════════════════════════════════════════╝\n");
}

/**
 * Called when a subscription is canceled.
 * User might still have access until the end of the billing period.
 *
 * @param customerId - The Polar customer ID
 */
export function onSubscriptionCanceled(customerId: string): void {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║  ⚠️  SUBSCRIPTION CANCELED                 ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  Customer: ${customerId.padEnd(30)}║`);
  console.log("║                                            ║");
  console.log("║  TODO in production:                       ║");
  console.log("║  • Mark subscription as 'canceling'        ║");
  console.log("║  • Schedule access revocation for end date ║");
  console.log("║  • Send 'sorry to see you go' email        ║");
  console.log("╚════════════════════════════════════════════╝\n");
}

/**
 * Called when a subscription is immediately revoked.
 * Access should be removed RIGHT NOW.
 *
 * @param customerId - The Polar customer ID
 */
export function onSubscriptionRevoked(customerId: string): void {
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║  🚫 SUBSCRIPTION REVOKED                   ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  Customer: ${customerId.padEnd(30)}║`);
  console.log("║                                            ║");
  console.log("║  TODO in production:                       ║");
  console.log("║  • IMMEDIATELY revoke access               ║");
  console.log("║  • Log for fraud investigation             ║");
  console.log("╚════════════════════════════════════════════╝\n");
}

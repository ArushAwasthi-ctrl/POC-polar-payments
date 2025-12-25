// src/App.tsx
// ============
// This is the main React component for our frontend.
//
// BILLING MENTAL MODEL (CRITICAL):
// --------------------------------
// 1. Frontend NEVER talks to Polar directly
// 2. Frontend NEVER enables subscriptions based on redirects
// 3. Frontend only does TWO things:
//    a) Calls YOUR backend to get a checkout URL
//    b) Redirects user to that URL
//
// The "success page" after checkout is just for UX.
// The REAL subscription activation happens via webhook → backend.

import Header from "./components/Header";
import Footer from "./components/Footer";
import Card from "./components/Card";
import "./App.css";

// Backend URL - in production, this would come from environment
const BACKEND_URL = "http://localhost:3000";

// Plan IDs that match what backend expects
type PlanId = "pro" | "master";

/**
 * Calls our backend to create a Polar checkout session.
 * Returns the checkout URL where we redirect the user.
 *
 * WHY GO THROUGH BACKEND?
 * -----------------------
 * If frontend called Polar directly, we'd need to put
 * POLAR_ACCESS_TOKEN in the browser → anyone could steal it!
 *
 * Backend keeps secrets safe and controls what checkouts are created.
 */
async function createCheckout(planId: PlanId): Promise<string> {
  console.log(`[Frontend] Creating checkout for plan: ${planId}`);

  const response = await fetch(`${BACKEND_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create checkout");
  }

  const data = await response.json();
  console.log(`[Frontend] Got checkout URL:`, data.url);
  return data.url;
}

/**
 * Handles the "Buy" button click.
 * 1. Creates checkout session via backend
 * 2. Redirects user to Polar's checkout page
 * 3. After payment, Polar redirects to success page
 *
 * IMPORTANT: The redirect to success page does NOT mean payment succeeded!
 * Only the webhook confirms that. The success page is just for UX.
 */
async function handleBuy(planId: PlanId): Promise<void> {
  try {
    // Show loading state (in real app, you'd disable button, show spinner)
    console.log(`[Frontend] User clicked Buy for: ${planId}`);

    // Step 1: Ask backend to create checkout session
    const checkoutUrl = await createCheckout(planId);

    // Step 2: Redirect user to Polar's checkout page
    // This takes them OFF your site to complete payment
    console.log(`[Frontend] Redirecting to Polar checkout...`);
    window.location.href = checkoutUrl;

    // After this, the flow is:
    // 1. User completes payment on Polar
    // 2. Polar redirects user to your success URL
    // 3. Polar sends webhook to your backend (THIS is the source of truth)
    // 4. Your backend updates database based on webhook
  } catch (error) {
    // In real app: show error toast, re-enable button
    console.error("[Frontend] Checkout failed:", error);
    alert(
      `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function App() {
  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          padding: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Pro Plan Card */}
        <Card
          image="/Gemini_Generated_Image_i6sgm1i6sgm1i6sg.png"
          title="Pro Plan"
          onBuy={() => handleBuy("pro")}
        />

        {/* Master Plan Card */}
        <Card
          image="/77e9208e7e3b3c7a00e9fbd4eaddcd3b.jpg"
          title="Master Plan"
          onBuy={() => handleBuy("master")}
        />
      </div>

      {/* Simple explanation for the POC */}
      <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
        <p>Click "Buy" to start checkout with Polar (sandbox mode)</p>
        <p style={{ fontSize: "0.875rem" }}>
          Frontend → Backend → Polar → User pays → Webhook → Backend logs
        </p>
      </div>

      <Footer />
    </>
  );
}

export default App;

// src/index.ts
// =============
// This is the entry point of our backend server.
// It does 3 things:
// 1. Loads environment variables from .env
// 2. Creates a Hono app with routes
// 3. Starts the HTTP server on a port

// STEP 1: Load environment variables FIRST
// -----------------------------------------
// This MUST be the first import. It reads .env file and puts values into process.env
// If we import other files first, they might try to read process.env before it's populated
import "dotenv/config";

// STEP 2: Import Hono and our routes
// ----------------------------------
import { Hono } from "hono";
import { serve } from "@hono/node-server"; // This is the Node.js adapter for Hono
import { cors } from "hono/cors"; // We need this so frontend can call our API
import { billingWebhooks } from "./billing/billing.webhook.js";
import { billingRpc } from "./rpc/billing.rpc.js";

// STEP 3: Create the Hono app
// ---------------------------
const app = new Hono();

// Enable CORS so frontend (localhost:5173) can call backend (localhost:3000)
// Without this, browsers block cross-origin requests for security
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

// Health check route - useful to verify server is running
// Try: curl http://localhost:3000/
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Polar Payments POC Backend",
    env_check: {
      has_polar_token: !!process.env.POLAR_ACCESS_TOKEN,
      has_webhook_secret: !!process.env.POLAR_WEBHOOK_SECRET,
      has_pro_product: !!process.env.POLAR_PRO_PRODUCT_ID,
      has_master_product: !!process.env.POLAR_MASTER_PRODUCT_ID,
    },
  });
});

// Checkout endpoint - frontend calls this when user clicks "Buy"
// This creates a Polar checkout session and returns the URL
app.post("/checkout", billingRpc.createCheckout);

// Webhook endpoint - Polar calls this when subscription events happen
// This is mounted at /api/webhooks/polar
app.route("/", billingWebhooks);

// STEP 4: Start the server
// ------------------------
const port = Number(process.env.PORT) || 3000;

// serve() is from @hono/node-server - it creates a real Node.js HTTP server
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`
========================================
  Polar Payments POC Backend
========================================
  Server running on: http://localhost:${info.port}

  Routes:
    GET  /                    - Health check
    POST /checkout            - Create checkout session
    POST /api/webhooks/polar  - Webhook receiver

  Environment:
    POLAR_ACCESS_TOKEN: ${process.env.POLAR_ACCESS_TOKEN ? "✓ Set" : "✗ Missing"}
    POLAR_WEBHOOK_SECRET: ${process.env.POLAR_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing"}
========================================
`);
  }
);

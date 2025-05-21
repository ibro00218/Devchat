import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";

// 🔐 Initialize Firebase Admin with secret from Render secret file
const serviceAccount = JSON.parse(
  fs.readFileSync("/etc/secrets/firebaseServiceAccountKey.json", "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🧾 Request logging middleware for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 🛑 Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // 🧪 Development: Vite dev server
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // 🚀 Production: Serve built static files
    serveStatic(app);
  }

  // 🌐 Always serve on port 5000 for Render compatibility
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server is running on port ${port}`);
    }
  );
})();

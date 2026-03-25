# Kubernetes Probes Reference Guide

This document serves as a personal reference for configuring and using Kubernetes probes across the SkillStew microservices. While the examples below specifically reference the `user` service, the concepts apply broadly to all services in the cluster.

## 1. Liveness Probe

**Purpose**: Verifies that the pod is up and physically running.

- If an `httpGet` probe returns a status code outside the 200–399 range, the kubelet considers the probe failed and restarts the pod.

### Deployment Configuration

_Example from `infra/k8s/user-depl.yaml` (typically commented out during local dev):_

```yaml
spec:
  containers:
    - name: user
      image: faheem222/user
      envFrom:
        - secretRef:
            name: infisical-secrets
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 3
        periodSeconds: 3
```

_This provides a 3-second initial delay before checking the endpoint every 3 seconds._

### Express Endpoint Implementation

```typescript
// other app setup
app.use("/api/v1/me", meRouter);
app.use("/api/v1/connections", connectionRouter);

// health check
app.get("/health", (req, res, next) => {
  res.status(200).json({ success: true, message: "Up and running!" });
});

app.use(errorHandler);

export { app };
```

## 2. Startup Probe

**Purpose**: Protects slow-starting containers. It gives the application ample time to finish its boot sequence (e.g., establishing database connections, pulling initial state) without failing a strict liveness probe.

- Liveness and readiness probes **do not start** until the startup probe succeeds at least once.

### Deployment Configuration

```yaml
spec:
  containers:
    - name: user
      image: faheem222/user
      # ... env and livenessProbe ...
      startupProbe:
        httpGet:
          path: /health
          port: 3000
        failureThreshold: 30
        periodSeconds: 10
```

> _"Thanks to the startup probe, the application will have a maximum of 5 minutes (30 _ 10 = 300s) to finish its startup. Once the startup probe has succeeded once, the liveness probe takes over... If the startup probe never succeeds, the container is killed after 300s and subject to the pod's restartPolicy."\* — [Kubernetes Docs](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

## 3. Readiness Probe

**Purpose**: Ensures that no traffic is routed to the service until it is fully initialized and actually ready to handle requests.

- In the `user` service, this means waiting for the Postgres connection to be established and the username Bloom filter to be initialized.

### Deployment Configuration

```yaml
spec:
  containers:
    - name: user
      image: faheem222/user
      # ... livenessProbe and startupProbe ...
      readinessProbe:
        httpGet:
          path: /readiness
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
```

### Express Endpoint Implementation (`app.ts`)

A simple boolean flag dictates the readiness state of the application:

```typescript
let ready = false;

export function markReady() {
  ready = true;
}

// readiness probe
app.get("/readiness", (_req, res) => {
  if (ready) {
    res
      .status(HttpStatus.OK)
      .json({ success: true, message: "Ready for traffic!" });
  } else {
    res
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json({ success: false, message: "Not ready yet!" });
  }
});
```

### Application Lifecycle Trigger (`start.ts`)

The `markReady()` function is only invoked after all intensive setup tasks are complete:

```typescript
import { app, markReady } from "./app";

async function start() {
  try {
    logger.info("Attempting to ping database...");
    await db.execute("select 1");
    logger.info("Successfully pinged database");
  } catch (err) {
    logger.error("Error while pinging database", err);
    throw mapDrizzleError(err);
  }

  logger.info("Connected to database");

  // Wait for heavy initialization task
  await initializeUsernameBloomfilterUsecase.exec();

  app.listen(ENV.PORT, () => {
    logger.info(`Listening on port ${ENV.PORT}`);
  });

  // Mark server as ready to accept traffic
  markReady();
}

start();
```

## Technical Notes & Gotchas

### Skaffold Sync Mode and Liveness Probes

**Disable `livenessProbe` definitions when using Skaffold's file sync mode.**

- Skaffold hot-syncs code changes directly into the running container's filesystem without rebuilding the Docker image.
- If the kubelet restarts the pod (which can happen if the server crashes, becomes unresponsive, or if you break the `/health` endpoint during dev, causing the liveness probe to fail), the container restarts from its original Docker image state.
- **Result**: All hot-synced code changes are wiped out, and the container reverts to running stale code.

---

**References:**

- [Configure Liveness, Readiness and Startup Probes (k8s docs)](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

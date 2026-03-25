import { RequestHandler } from "express";
import { createApp, buildProxyOptions } from "../app/createApp";
import { routeGroups } from "../config/routeManifest";
import { createTestEnv } from "./helpers";

describe("createApp", () => {
  it("builds proxy targets from base service urls and route prefixes", () => {
    const env = createTestEnv();
    const proxyTargets: string[] = [];

    createApp(env, (options) => {
      proxyTargets.push(String(options.target));
      const handler = ((_req, _res, next) => next()) as RequestHandler & {
        upgrade: () => void;
      };
      handler.upgrade = () => undefined;
      return handler;
    });

    expect(proxyTargets).toHaveLength(routeGroups.length);
    expect(proxyTargets).toContain(
      "http://user-srv.default.svc.cluster.local:3000/api/v1/auth",
    );
    expect(proxyTargets).toContain(
      "http://user-srv.default.svc.cluster.local:3000/api/v1/users",
    );
    expect(proxyTargets).toContain(
      "http://skill-srv.default.svc.cluster.local:3000/api/v1/skills",
    );
  });

  it("builds proxy options with timeouts and error hooks", () => {
    const options = buildProxyOptions(
      routeGroups.find((group) => group.prefix === "/api/v1/notifications")!,
      "http://notification-srv.default.svc.cluster.local:3000",
    );

    expect(options.target).toBe(
      "http://notification-srv.default.svc.cluster.local:3000/api/v1/notifications",
    );
    expect(options.changeOrigin).toBe(true);
    expect(options.proxyTimeout).toBe(10_000);
    expect(options.timeout).toBe(10_000);
    expect(options.on).toBeDefined();
    expect(typeof options.on?.error).toBe("function");
    expect(typeof options.on?.proxyReq).toBe("function");
  });
});

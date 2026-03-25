import {
  getMatchingRouteGroup,
  resolveAuthPolicy,
} from "../config/routeManifest";

describe("routeManifest", () => {
  it("returns the matching prefix group", () => {
    const group = getMatchingRouteGroup("/api/v1/users/onboarding/profile");

    expect(group).toBeDefined();
    expect(group?.prefix).toBe("/api/v1/users");
    expect(group?.service).toBe("user");
  });

  it("prefers overrides over group defaults", () => {
    const group = getMatchingRouteGroup("/api/v1/users/onboarding/profile");

    expect(group).toBeDefined();

    const policy = resolveAuthPolicy(
      "/api/v1/users/onboarding/profile",
      "PATCH",
      group!,
    );

    expect(policy).toEqual({ required: true, roles: ["USER"] });
  });

  it("uses the group default when no override matches", () => {
    const group = getMatchingRouteGroup("/api/v1/auth/login");

    expect(group).toBeDefined();

    const policy = resolveAuthPolicy("/api/v1/auth/login", "POST", group!);

    expect(policy).toEqual({ required: false });
  });
});

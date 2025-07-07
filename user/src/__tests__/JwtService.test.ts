import {} from "jest";
import { JwtService } from "../2-infrastructure/services/JwtService";
import { generateTokenDto } from "../1-application/ports/IJwtService";

const jwtSrv = new JwtService({
  adminAccessTokenSecret: "hello",
  adminRefreshTokenSecret: "hello",
  emailJwtSecret: "hello",
  expertAccessTokenSecret: "hello",
  expertRefreshTokenSecret: "hello",
  userAccessTokenSecret: "hello",
  userRefreshTokenSecret: "hello",
});
const dto: generateTokenDto = {
  email: "someone@gmail.com",
  role: "USER",
  userId: 2,
};

function myFunc() {
  const token = jwtSrv.generateAccessToken(dto, "USER");
  return jwtSrv.verifyAccessToken(token);
}

it("returns a valid jwt payload", () => {
  expect(myFunc()).toBe<object>({});
});

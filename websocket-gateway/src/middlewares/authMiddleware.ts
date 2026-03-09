import { Socket } from "socket.io";
import { JwtService } from "../utils/JwtService";
import { ENV } from "../utils/dotenv";

const jwtService = new JwtService({
  adminAccessTokenSecret: ENV.ADMIN_ACCESS_TOKEN_SECRET,
  expertAccessTokenSecret: ENV.EXPERT_ACCESS_TOKEN_SECRET,
  userAccessTokenSecret: ENV.USER_ACCESS_TOKEN_SECRET,
});

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth?.token?.split(" ")[1];
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = jwtService.verifyAccessToken(token);

    // Attach user data to socket.data — available in all event handlers
    socket.data.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
};

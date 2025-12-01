import { AuthController } from "../presentation/controllers/AuthController";
import { AuthUsecases } from "../application/use-cases/AuthUsecases";
import { UserRepository } from "../infrastructure/repositories/UserRepository";
import { EmailService } from "../infrastructure/services/EmailService";
import { JwtService } from "../infrastructure/services/JwtService";
import { BcryptHasher } from "../infrastructure/services/HashService";
import { ENV } from "../utils/dotenv";
import { AdminRepository } from "../infrastructure/repositories/AdminRepository";
import { UserUsecases } from "../application/use-cases/UserUsecases";
import { UserController } from "../presentation/controllers/UserController";
import { Consumer, Producer } from "@skillstew/common";
import { OAuth2Client } from "google-auth-library";
import { UpdateUserProfile } from "../application/use-cases/user/UpdateUserProfile.usecase";
import { GetCurrentUserProfile } from "../application/use-cases/user/GetCurrentUserProfile.usecase";
import { UserOnboardingController } from "../presentation/controllers/UserOnboardingController";
import { OnboardingUpdateProfile } from "../application/use-cases/user/OnboardingUpdateUserProfile.usecase";
import { GoogleLocationProvider } from "../infrastructure/services/GoogleLocationProvider";
import { CurrentUserProfileController } from "../presentation/controllers/CurrentUserProfileController";
import { GetCurrentExpertProfileUsecase } from "../application/use-cases/expert/GetCurrentExpertProfile.usecase";
import { GetCurrentAdminProfileUsecase } from "../application/use-cases/admin/GetCurrentAdminProfile.usecase";

// Services
const emailService = new EmailService();
const jwtService = new JwtService({
  adminAccessTokenSecret: ENV.ADMIN_ACCESS_TOKEN_SECRET,
  adminRefreshTokenSecret: ENV.ADMIN_REFRESH_TOKEN_SECRET,
  expertAccessTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  expertRefreshTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  userAccessTokenSecret: ENV.USER_ACCESS_TOKEN_SECRET,
  userRefreshTokenSecret: ENV.USER_REFRESH_TOKEN_SECRET,
  emailJwtSecret: ENV.EMAIL_VERIFICATON_JWT_SECRET,
});
const hasherService = new BcryptHasher();
const locationProvider = new GoogleLocationProvider();

// OAuthClient
const oAuthClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

// Repositories
const userRepo = new UserRepository();
const adminRepo = new AdminRepository();

// RabbitMQ
export const consumer = new Consumer();
export const producer = new Producer();

// Usecases
const authUsecases = new AuthUsecases(
  userRepo,
  emailService,
  jwtService,
  hasherService,
  adminRepo,
  producer,
  oAuthClient,
);
const userUsecases = new UserUsecases(userRepo);
const updateUserProfileUsecase = new UpdateUserProfile(
  producer,
  userRepo,
  locationProvider,
);
const getCurrentUserProfileUsecase = new GetCurrentUserProfile(userRepo);
const getCurrentExpertProfileUsecase = new GetCurrentExpertProfileUsecase();
const getCurrentAdminProfileUsecase = new GetCurrentAdminProfileUsecase(
  adminRepo,
);
const onboardingUpdateUserProfileUsecase = new OnboardingUpdateProfile(
  producer,
  userRepo,
  locationProvider,
);

// Controllers
export const authController = new AuthController(authUsecases);
export const userController = new UserController(
  userUsecases,
  updateUserProfileUsecase,
);
export const onboardingController = new UserOnboardingController(
  onboardingUpdateUserProfileUsecase,
);
export const currentUserProfileController = new CurrentUserProfileController(
  getCurrentUserProfileUsecase,
  getCurrentExpertProfileUsecase,
  getCurrentAdminProfileUsecase,
);

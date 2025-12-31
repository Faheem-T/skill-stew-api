import { AuthController } from "../presentation/controllers/AuthController";
import { UserRepository } from "../infrastructure/repositories/UserRepository";
import { EmailService } from "../infrastructure/services/EmailService";
import { JwtService } from "../infrastructure/services/JwtService";
import { BcryptHasher } from "../infrastructure/services/HashService";
import { ENV } from "../utils/dotenv";
import { UserController } from "../presentation/controllers/UserController";
import { OAuth2Client } from "google-auth-library";
import { UpdateUserProfile } from "../application/use-cases/user/UpdateUserProfile.usecase";
import { GetCurrentUserProfile } from "../application/use-cases/user/GetCurrentUserProfile.usecase";
import { UserOnboardingController } from "../presentation/controllers/UserOnboardingController";
import { OnboardingUpdateProfile } from "../application/use-cases/user/OnboardingUpdateUserProfile.usecase";
import { GoogleLocationProvider } from "../infrastructure/services/GoogleLocationProvider";
import { CurrentUserProfileController } from "../presentation/controllers/CurrentUserProfileController";
import { GetCurrentExpertProfileUsecase } from "../application/use-cases/expert/GetCurrentExpertProfile.usecase";
import { S3StorageService } from "../infrastructure/services/S3StorageService";
import { GeneratePresignedUploadUrl } from "../application/use-cases/common/GeneratePresignedUploadUrl.usecase";
import { UserProfileRepository } from "../infrastructure/repositories/UserProfileRepository";
import { RegisterUser } from "../application/use-cases/auth/RegisterUser.usecase";
import { LoginUser } from "../application/use-cases/auth/LoginUser.usecase";
import { GoogleAuth } from "../application/use-cases/auth/GoogleAuth.usecase";
import { SendVerificationLink } from "../application/use-cases/auth/SendVerificationLink.usecase";
import { VerifyUser } from "../application/use-cases/auth/VerifyUser.usecase";
import { GenerateAccessToken } from "../application/use-cases/auth/GenerateAccessToken.usecase";
import { CreateAdmin } from "../application/use-cases/admin/CreateAdmin.usecase";
import { UpdateUserBlockStatus } from "../application/use-cases/admin/UpdateUserBlockStatus.usecase";
import { GetUsers } from "../application/use-cases/admin/GetUsers.usecase";
import amqp from "amqplib";
import { EventConsumer } from "../infrastructure/services/EventConsumer";
import { EventProducer } from "../infrastructure/services/EventProducer";

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
const s3StorageService = new S3StorageService();

// OAuthClient
const oAuthClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

// Repositories
const userRepo = new UserRepository();
const userProfileRepo = new UserProfileRepository();

// RabbitMQ
const EXCHANGE_NAME = "stew_exchange";
const QUEUE_NAME = "user_service_queue";
const connection = await amqp.connect(
  `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
);
const channel = await connection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", {
  durable: true,
});
const queue = await channel.assertQueue(QUEUE_NAME, {
  durable: true,
});

export const consumer = new EventConsumer(channel, queue.queue, EXCHANGE_NAME);
const producer = new EventProducer(channel, "stew_exchange");

// Usecases
const registerUserUsecase = new RegisterUser(
  userRepo,
  userProfileRepo,
  producer,
  hasherService,
  jwtService,
);
const loginUserUsecase = new LoginUser(userRepo, jwtService, hasherService);
const googleAuthUsecase = new GoogleAuth(
  userRepo,
  userProfileRepo,
  oAuthClient,
  producer,
  jwtService,
);
const sendVerificationLinkUsecase = new SendVerificationLink(
  userRepo,
  jwtService,
  emailService,
);
const verifyUserUsecase = new VerifyUser(userRepo, jwtService, producer);
const generateAccessTokenUsecase = new GenerateAccessToken(jwtService);
const createAdminUsecase = new CreateAdmin(userRepo, hasherService);
const updateUserProfileUsecase = new UpdateUserProfile(
  producer,
  userProfileRepo,
  locationProvider,
  s3StorageService,
);
const getCurrentUserProfileUsecase = new GetCurrentUserProfile(
  userRepo,
  userProfileRepo,
  s3StorageService,
);
const getCurrentExpertProfileUsecase = new GetCurrentExpertProfileUsecase();
const onboardingUpdateUserProfileUsecase = new OnboardingUpdateProfile(
  producer,
  userProfileRepo,
  locationProvider,
);
const generatePresignedUploadUrlUsecase = new GeneratePresignedUploadUrl(
  s3StorageService,
);
const updateUserBlockStatusUsecase = new UpdateUserBlockStatus(userRepo);
const getUsersUsecase = new GetUsers(userRepo);

// Controllers
export const authController = new AuthController(
  registerUserUsecase,
  loginUserUsecase,
  googleAuthUsecase,
  sendVerificationLinkUsecase,
  verifyUserUsecase,
  generateAccessTokenUsecase,
  createAdminUsecase,
);
export const userController = new UserController(
  updateUserProfileUsecase,
  getUsersUsecase,
  updateUserBlockStatusUsecase,
);
export const onboardingController = new UserOnboardingController(
  onboardingUpdateUserProfileUsecase,
);
export const currentUserProfileController = new CurrentUserProfileController(
  getCurrentUserProfileUsecase,
  getCurrentExpertProfileUsecase,
  generatePresignedUploadUrlUsecase,
);

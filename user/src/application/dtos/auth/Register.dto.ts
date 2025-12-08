import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password has to be 8 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must include at least one special character (@$!%*?&)",
    ),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export type RegisterOutputDTO =
  | {
      success: true;
      refreshToken: string;
      accessToken: string;
    }
  | {
      success: false;
      userAlreadyExists: boolean;
    };

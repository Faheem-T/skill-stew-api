import z from "zod";

export const updateUsernameSchema = z.object({
  userId: z.string(),
  username: z
    .string()
    .min(5)
    .max(20)
    .regex(/^[a-zA-Z0-9._]+$/, "Only letters, numbers, . and _ allowed")
    .transform((val) => val.toLowerCase())
    .refine((v) => !v.startsWith(".") && !v.startsWith("_"), {
      message: "Username cannot start with '.' or '_'",
    })
    .refine((v) => !v.endsWith(".") && !v.endsWith("_"), {
      message: "Username cannot end with '.' or '_'",
    })
    .refine((v) => !/([._]{2})/.test(v), {
      message: "No consecutive '.' or '_'",
    }),
});

export type UpdateUsernameDTO = z.infer<typeof updateUsernameSchema>;

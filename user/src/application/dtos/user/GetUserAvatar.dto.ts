import z from "zod";

export const getUserAvatarSchema = z.object({
  userId: z.string().nonempty(),
});

export type GetUserAvatarDTO = z.infer<typeof getUserAvatarSchema>;

export interface GetUserAvatarOutputDTO {
  avatarUrl: string | null;
}

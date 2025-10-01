import { z } from "zod";

export const IDSchema = z.string().uuid("Invalid ID");

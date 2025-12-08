import { SendVerificationLinkDTO } from "../../dtos/auth/SendVerificationLink.dto";

export interface ISendVerificationLink {
  exec(dto: SendVerificationLinkDTO): Promise<void>;
}

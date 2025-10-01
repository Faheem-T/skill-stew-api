import { hashSync, genSaltSync, compareSync } from "bcrypt";
import { IHasherService } from "../../application/ports/IHasherService";

export class BcryptHasher implements IHasherService {
  SALT_ROUNDS: number;
  constructor() {
    this.SALT_ROUNDS = 10;
  }

  hash(input: string): string {
    const salt = genSaltSync(this.SALT_ROUNDS);
    return hashSync(input, salt);
  }

  compare(input: string, hash: string): boolean {
    return compareSync(input, hash);
  }
}

import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class DuplicateSkillInProfileError extends DomainError {
  constructor(skillId: string) {
    super(DomainErrorCodes.DUPLICATE_SKILL_IN_PROFILE, `Skill with ID '${skillId}' already exists in profile.`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
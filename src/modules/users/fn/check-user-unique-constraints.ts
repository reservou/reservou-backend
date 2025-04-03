import { ConflictError } from "@/lib/errors";
import { Injectable } from "@nestjs/common";
import { EMAIL_IN_USE_MSG } from "../users.constants";
import { UsersRepository } from "../users.repository";

export interface UniqueConstraints {
	email: string;
}

@Injectable()
export class CheckUserUniqueConstraints {
	constructor(private readonly usersRepo: UsersRepository) {}

	/**
	 * Throws if any of the constraints are not unique
	 * @throws {ConflictError}
	 */
	async execute({ email }: UniqueConstraints) {
		const conflictingUser = await this.usersRepo.findByEmail(email);

		if (conflictingUser) {
			throw new ConflictError(EMAIL_IN_USE_MSG);
		}
	}
}

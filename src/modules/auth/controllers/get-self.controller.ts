import { InternalServerError } from "@/lib/errors";
import { UsersRepository } from "@/modules/users/users.repository";
import { Controller, Get, Res } from "@nestjs/common";
import { FastifyReply } from "fastify";
import {
	CurrentUser,
	GetCurrentUser,
} from "../decorators/get-current-user.decorator";
import { GetSelfResponseDto } from "../outputs/get-self.output";

@Controller("/self")
export class GetSelfController {
	constructor(private readonly usersRepo: UsersRepository) {}

	@Get()
	async getSelf(
		@GetCurrentUser() user: CurrentUser,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const userFromDb = await this.usersRepo.findById(user.id);
		if (!userFromDb) {
			/**
			 * @todo - Instrumentation
			 * captureException(e)
			 */
			reply.clearCookie("Authorization", { httpOnly: true });
			throw new InternalServerError(
				"Authenticated user does not exist on database",
				{
					user,
				},
			);
		}

		return new GetSelfResponseDto(
			{
				email: userFromDb.email,
				id: userFromDb.id,
				name: userFromDb.name,
				hotel: userFromDb.hotel,
			},
			"success",
		);
	}
}

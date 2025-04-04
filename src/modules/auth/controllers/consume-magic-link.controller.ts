import { Controller, Get, Param, Res } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { FastifyReply } from "fastify";
import { Public } from "../decorators/public.decorator";
import { ConsumeMagicLink } from "../fn/consume-magic-link";
import { ConsumeMagicLinkRequestDto } from "../inputs/consume-magic-link.input";
import { ConsumeMagicLinkResponseDto } from "../outputs/consume-magic-link.output";
import { setAuthorizationCookie } from "../utils/set-authorization-cookie";

@Public()
@ApiTags("Auth")
@Controller("magic-link")
export class ConsumeMagicLinkController {
	constructor(private readonly consumeMagicLink: ConsumeMagicLink) {}

	@Get(":token")
	@ApiOperation({ summary: "Consume a magic link to authenticate" })
	@ApiOkResponse({
		description: "User authenticated, JWT set in cookie",
		type: ConsumeMagicLinkResponseDto,
	})
	@ApiBadRequestResponse({ description: "Invalid or expired token" })
	async consume(
		@Param() { token }: ConsumeMagicLinkRequestDto,
		@Res({ passthrough: true }) reply: FastifyReply,
	): Promise<ConsumeMagicLinkResponseDto> {
		const result = await this.consumeMagicLink.execute(token);

		setAuthorizationCookie(reply, result.authorizationToken);

		const { authorizationToken, ...userInfo } = result;
		return new ConsumeMagicLinkResponseDto(
			userInfo,
			"Magic link consumed successfully",
		);
	}
}

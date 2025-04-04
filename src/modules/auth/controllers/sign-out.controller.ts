import { BaseResponseDto } from "@/lib/outputs/base.output";
import { Controller, Get, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply } from "fastify";
import { clearAuthorizationCookie } from "../utils/clear-authorization-cookie";

@ApiTags("Auth")
@Controller("sign-out")
export class SignOutController {
	@Get()
	@ApiOperation({ summary: "Signs out the user" })
	@ApiOkResponse({ description: "Sgined" })
	signOut(@Res({ passthrough: true }) reply: FastifyReply): void {
		clearAuthorizationCookie(reply);
		reply
			.status(200)
			.send(new BaseResponseDto(null, "Sessão encerrada, até mais."));
	}
}

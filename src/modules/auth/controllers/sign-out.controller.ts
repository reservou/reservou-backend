import { BaseResponseDto } from "@/lib/outputs/base.output";
import { Controller, Get, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FastifyReply } from "fastify";

@ApiTags("Auth")
@Controller("sign-out")
export class SignOutController {
	@Get()
	@ApiOperation({ summary: "Signs out the user" })
	@ApiOkResponse({ description: "Sgined" })
	signOut(@Res({ passthrough: true }) reply: FastifyReply): void {
		reply.clearCookie("Authorization", { httpOnly: true });
		reply
			.status(200)
			.send(new BaseResponseDto(null, "Sessão encerrada, até mais."));
	}
}

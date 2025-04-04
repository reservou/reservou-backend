import { BaseResponseDto } from "@/lib/outputs/base.output";
import {
	CurrentUser,
	GetCurrentUser,
} from "@/modules/auth/decorators/get-current-user.decorator";
import { AccessTokenPayload } from "@/modules/auth/fn/consume-magic-link";
import { setAuthorizationCookie } from "@/modules/auth/utils/set-authorization-cookie";
import { JwtService } from "@/modules/jwt/jwt.service";
import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";
import { FastifyReply } from "fastify";
import { CreateHotel, CreateHotelInput } from "../fn/create-hotel";
import { CreateHotelResponseDto } from "../outputs/create-hotel.output";

@Controller("hotels")
export class CreateHotelController {
	constructor(
		private readonly createHotel: CreateHotel,
		private readonly jwtService: JwtService,
	) {}

	@Post()
	@ApiCreatedResponse({
		type: CreateHotelResponseDto,
		description: "Hotel created successfully",
	})
	@ApiConflictResponse({
		type: BaseResponseDto,
		description: "User already has a hotel associated",
	})
	async handlePost(
		@GetCurrentUser() user: CurrentUser,
		@Body() body: CreateHotelInput,
		@Res({ passthrough: true }) reply: FastifyReply,
	) {
		const hotel = await this.createHotel.execute(body, user.id);
		const token = this.jwtService.sign({
			hid: hotel.id,
			uid: user.id,
		} satisfies AccessTokenPayload);

		setAuthorizationCookie(reply, token);
		return new CreateHotelResponseDto(hotel, "Hotel criado com sucesso!");
	}
}

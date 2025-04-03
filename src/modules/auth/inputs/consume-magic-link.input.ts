import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ConsumeMagicLinkRequestDto {
	@ApiProperty({ description: "Magic link token", example: "abc123" })
	@IsString()
	@MinLength(1)
	token!: string;
}

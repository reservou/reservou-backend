import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class SignInRequestDto {
	@ApiProperty({
		description: "User's email address",
		example: "john@example.com",
	})
	@IsEmail()
	email!: string;
}

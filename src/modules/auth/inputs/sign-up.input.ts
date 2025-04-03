import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignUpRequestDto {
	@ApiProperty({ description: "User's full name", example: "John Doe" })
	@IsString()
	@MinLength(2)
	name!: string;

	@ApiProperty({
		description: "User's email address",
		example: "john@example.com",
	})
	@IsEmail()
	email!: string;
}

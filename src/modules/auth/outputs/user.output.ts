import { ApiProperty } from "@nestjs/swagger";

export class UserData {
	@ApiProperty({ type: String, description: "User ID" })
	id!: string;

	@ApiProperty({ type: String, description: "User name" })
	name!: string;

	@ApiProperty({ type: String, description: "User email" })
	email!: string;
}

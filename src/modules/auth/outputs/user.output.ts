import { ApiProperty } from "@nestjs/swagger";

export class UserInfo {
	@ApiProperty({ type: String, description: "User ID" })
	id!: string;

	@ApiProperty({ type: String, description: "User name" })
	name!: string;

	@ApiProperty({ type: String, description: "User email" })
	email!: string;

	@ApiProperty({
		type: String,
		nullable: true,
	})
	hotel!: string | null;
}

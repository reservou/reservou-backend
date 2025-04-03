import { ApiProperty } from "@nestjs/swagger";

export class MessageData {
	@ApiProperty({ type: String, description: "A success message" })
	message!: string;
}

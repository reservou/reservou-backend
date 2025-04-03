import { ErrorObject } from "@/lib/errors";
import { ApiProperty } from "@nestjs/swagger";

export class BaseResponseDto<T> {
	@ApiProperty({ description: "The response data" })
	data: T;

	@ApiProperty({
		description: "Error details if any",
		type: "object",
		properties: {
			statusCode: { type: "number" },
			status: { type: "string" },
			message: { type: "string" },
			details: { type: "object", nullable: true, additionalProperties: {} },
			code: { type: "string", nullable: true },
			correlationId: { type: "string" },
		},
		nullable: true,
	})
	error: ErrorObject | null;

	@ApiProperty({ description: "A human-readable message about the response" })
	message: string;

	constructor(data: T, message: string, error: ErrorObject | null = null) {
		this.data = data;
		this.error = error;
		this.message = message;
	}
}

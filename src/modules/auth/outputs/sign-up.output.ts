import { BaseResponseDto } from "@/lib/outputs/base.output";
import { MessageData } from "@/lib/outputs/common";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpResponseDto extends BaseResponseDto<{ message: string }> {
	@ApiProperty({ type: () => MessageData })
	declare data: { message: string };
}

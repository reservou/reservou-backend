import { BaseResponseDto } from "@/lib/outputs/base.output";
import { MessageData } from "@/lib/outputs/common";
import { ApiProperty } from "@nestjs/swagger";

export class SignInResponseDto extends BaseResponseDto<{ message: string }> {
	@ApiProperty({ type: () => MessageData })
	declare data: { message: string };
}

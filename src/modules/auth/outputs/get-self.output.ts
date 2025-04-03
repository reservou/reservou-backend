import { BaseResponseDto } from "@/lib/outputs/base.output";
import { ApiProperty } from "@nestjs/swagger";
import { UserData } from "./user.output";

export class GetSelfResponseDto extends BaseResponseDto<{
	id: string;
	name: string;
	email: string;
}> {
	@ApiProperty({ type: () => UserData })
	declare data: { id: string; name: string; email: string };
}

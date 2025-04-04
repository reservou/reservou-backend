import { BaseResponseDto } from "@/lib/outputs/base.output";
import { ApiProperty } from "@nestjs/swagger";
import { UserInfo } from "./user.output";

export class GetSelfResponseDto extends BaseResponseDto<UserInfo> {
	@ApiProperty({ type: () => UserInfo })
	declare data: UserInfo;
}

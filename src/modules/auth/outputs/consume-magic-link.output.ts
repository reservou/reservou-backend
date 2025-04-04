import { BaseResponseDto } from "@/lib/outputs/base.output";
import { ApiProperty } from "@nestjs/swagger";
import { MagicLinkOutput } from "../fn/consume-magic-link";
import { UserInfo } from "./user.output";

export class ConsumeMagicLinkResponseDto extends BaseResponseDto<
	Omit<MagicLinkOutput, "authorizationToken">
> {
	@ApiProperty({ type: () => UserInfo })
	declare data: { id: string; name: string; email: string };
}

import { BaseResponseDto } from "@/lib/outputs/base.output";
import { ApiProperty } from "@nestjs/swagger";
import { MagicLinkOutput } from "../fn/consume-magic-link";
import { UserData } from "./user.output";

export class ConsumeMagicLinkResponseDto extends BaseResponseDto<
	Omit<MagicLinkOutput, "authorizationToken">
> {
	@ApiProperty({ type: () => UserData })
	declare data: { id: string; name: string; email: string };
}

import { BaseResponseDto } from "@/lib/outputs/base.output";
import { ApiProperty } from "@nestjs/swagger";
import { HotelInfo } from "./hotel.output";

export class CreateHotelResponseDto extends BaseResponseDto<HotelInfo> {
	@ApiProperty({ type: () => HotelInfo })
	declare data: HotelInfo;
}

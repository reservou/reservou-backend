import { Module } from "@nestjs/common";
import { MapsService } from "./maps.service";

@Module({
	imports: [],
	controllers: [],
	providers: [MapsService],
	exports: [MapsService],
})
export class MapsModule {}

import { Module } from "@nestjs/common";
import { JwtModule } from "../jwt/jwt.module";
import { MapsModule } from "../maps/maps.module";
import { MongoModule } from "../mongo/mongo.module";
import { UsersModule } from "../users/users.module";
import { CreateHotelController } from "./controllers/create-hotel.controller";
import { CreateHotel } from "./fn/create-hotel";
import { GenerateHotelSlug } from "./fn/generate-hotel-slug";
import { HotelsRepository } from "./hotels.repository";

@Module({
	imports: [JwtModule, MapsModule, MongoModule, UsersModule],
	controllers: [CreateHotelController],
	providers: [HotelsRepository, CreateHotel, GenerateHotelSlug],
})
export class HotelsModule {}

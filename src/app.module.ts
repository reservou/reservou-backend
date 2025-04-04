import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtGuard } from "./modules/auth/guards/jwt.guard";
import { HotelsModule } from "./modules/hotels/hotels.module";
import { JwtModule } from "./modules/jwt/jwt.module";

@Module({
	imports: [AuthModule, JwtModule, HotelsModule],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtGuard,
		},
	],
})
export class AppModule {}

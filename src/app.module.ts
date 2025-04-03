import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtGuard } from "./modules/auth/guards/jwt.guard";
import { JwtModule } from "./modules/jwt/jwt.module";

@Module({
	imports: [AuthModule, JwtModule],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtGuard,
		},
	],
})
export class AppModule {}

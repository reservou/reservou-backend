import { Module } from "@nestjs/common";
import { ConfirmationsModule } from "../confirmations/confirmations.module";
import { JwtModule } from "../jwt/jwt.module";
import { MailerModule } from "../mailer/mailer.module";
import { MongoModule } from "../mongo/mongo.module";
import { RedisModule } from "../redis/redis.module";
import { UsersModule } from "../users/users.module";
import { AuthRepository } from "./auth.repository";
import { ConsumeMagicLinkController } from "./controllers/consume-magic-link.controller";
import { GetSelfController } from "./controllers/get-self.controller";
import { SignInWithMagicLinkController } from "./controllers/sign-in-with-magic-link.controller";
import { SignOutController } from "./controllers/sign-out.controller";
import { SignUpWithMagicLinkController } from "./controllers/sign-up-with-magic-link.controller";
import { ConsumeMagicLink } from "./fn/consume-magic-link";
import { SignInWithMagicLink } from "./fn/sign-in-with-magic-link";
import { SignUpWithMagicLink } from "./fn/sign-up-with-magic-link";

@Module({
	imports: [
		MongoModule,
		RedisModule,
		JwtModule,
		UsersModule,
		MailerModule,
		RedisModule,
		ConfirmationsModule,
	],
	controllers: [
		SignInWithMagicLinkController,
		SignUpWithMagicLinkController,
		ConsumeMagicLinkController,
		GetSelfController,
		SignOutController,
	],
	providers: [
		SignInWithMagicLink,
		SignUpWithMagicLink,
		ConsumeMagicLink,
		AuthRepository,
	],
	exports: [SignInWithMagicLink, SignUpWithMagicLink, ConsumeMagicLink],
})
export class AuthModule {}

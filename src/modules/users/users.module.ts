import { Module } from "@nestjs/common";
import { MongoModule } from "../mongo/mongo.module";
import { CheckUserUniqueConstraints } from "./fn/check-user-unique-constraints";
import { UsersRepository } from "./users.repository";

@Module({
	imports: [MongoModule],
	controllers: [],
	providers: [UsersRepository, CheckUserUniqueConstraints],
	exports: [UsersRepository, CheckUserUniqueConstraints],
})
export class UsersModule {}

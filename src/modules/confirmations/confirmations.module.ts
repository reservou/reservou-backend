import { Module } from "@nestjs/common";
import { MongoModule } from "../mongo/mongo.module";
import { RedisModule } from "../redis/redis.module";
import { ConfirmationsRepository } from "./confirmations.repository";

@Module({
	imports: [RedisModule, MongoModule],
	controllers: [],
	providers: [ConfirmationsRepository],
	exports: [ConfirmationsRepository],
})
export class ConfirmationsModule {}

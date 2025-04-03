import { MongoDB } from "@/lib/db";
import { Module } from "@nestjs/common";

@Module({
	providers: [MongoDB],
	exports: [MongoDB],
})
export class MongoModule {}

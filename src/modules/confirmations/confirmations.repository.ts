import { MongoDB } from "@/lib/db";
import { RedisService } from "@/modules/redis/redis.service";
import { Injectable } from "@nestjs/common";
import { Collection, Document, ObjectId } from "mongodb";

export class Confirmation {
	id!: string;
	email!: string;
	expiry!: Date;
}

export type ConfirmationInsert = Omit<Confirmation, "id">;

type ConfirmationDocument = Document & Omit<Confirmation, "id">;
type ConfirmationCollection = Collection<ConfirmationDocument>;

@Injectable()
export class ConfirmationsRepository {
	private collection: () => Promise<ConfirmationCollection>;
	private readonly cachePrefix = "confirmation:";

	constructor(
		private readonly mongoDB: MongoDB,
		private readonly redisService: RedisService,
	) {
		this.collection =
			this.mongoDB.getCollectionBuilder<ConfirmationDocument>("confirmations");
	}

	async insert(data: ConfirmationInsert): Promise<Confirmation> {
		const coll = await this.collection();
		const result = await coll.insertOne({ ...data });
		const id = result.insertedId.toHexString();
		const confirmation = { ...data, id };

		const expiryInSeconds = Math.floor(
			(data.expiry.getTime() - Date.now()) / 1000,
		);
		if (expiryInSeconds > 0) {
			await this.redisService.set(
				`${this.cachePrefix}${id}`,
				confirmation,
				expiryInSeconds,
			);
		}

		return confirmation;
	}

	async expire(id: string): Promise<boolean> {
		const coll = await this.collection();
		const redisKey = `${this.cachePrefix}${id}`;

		const [dbResult, cacheResult] = await Promise.all([
			coll.deleteOne({ _id: new ObjectId(id) }),
			this.redisService.del(redisKey),
		]);

		return dbResult.deletedCount === 1 || cacheResult > 0;
	}

	async findById(id: string): Promise<Confirmation | null> {
		const redisKey = `${this.cachePrefix}${id}`;

		const cached = await this.redisService.get<Confirmation>(redisKey);
		if (cached) {
			if (new Date(cached.expiry) > new Date()) {
				return cached;
			}
			await this.redisService.del(redisKey);
		}

		const coll = await this.collection();
		const doc = await coll.findOne({ _id: new ObjectId(id) });
		if (!doc) return null;

		const confirmation = { ...doc, id: doc._id.toHexString() };

		if (new Date(confirmation.expiry) <= new Date()) {
			await this.expire(id);
			return null;
		}

		const secondsUntilExpiry = Math.floor(
			(confirmation.expiry.getTime() - Date.now()) / 1000,
		);
		if (secondsUntilExpiry > 0) {
			await this.redisService.set(redisKey, confirmation, secondsUntilExpiry);
		}

		return confirmation;
	}
}

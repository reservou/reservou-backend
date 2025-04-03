import { getEnv } from "@/env";
import { InternalServerError } from "@/lib/errors";
import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { Collection, Db, Document, MongoClient } from "mongodb";
import { CollectionKey } from "./constants";

interface MongoCache {
	client: MongoClient | null;
	db: Db | null;
	promise: Promise<{ client: MongoClient; db: Db }> | null;
}

declare global {
	var mongodb: MongoCache;
}

@Injectable()
export class MongoDB implements OnModuleInit, OnModuleDestroy {
	private cached: MongoCache = global.mongodb || {
		client: null,
		db: null,
		promise: null,
	};

	private logger = new Logger(MongoDB.name);

	constructor() {
		if (!global.mongodb) {
			global.mongodb = this.cached;
		}
	}

	async onModuleInit() {
		await this.connect();
	}

	async onModuleDestroy() {
		if (this.cached.client) {
			await this.cached.client.close();
			this.cached.client = null;
			this.cached.db = null;
			this.cached.promise = null;
			this.logger.log("Disconnected");
		}
	}

	private async connect(): Promise<{ client: MongoClient; db: Db }> {
		const MONGO_URI = getEnv("MONGO_URI");

		if (!MONGO_URI) {
			throw new InternalServerError(
				"Missing MONGO_URI in environment variables.",
			);
		}

		if (this.cached.client && this.cached.db) {
			this.logger.log("Resolved established connection");
			return { client: this.cached.client, db: this.cached.db };
		}

		if (!this.cached.promise) {
			this.logger.log("Stablishing connection");
			const opts = { appName: "livechords" };
			this.cached.promise = MongoClient.connect(MONGO_URI, opts).then(
				(client) => {
					const db = client.db();
					return { client, db };
				},
			);
		}

		try {
			const { client, db } = await this.cached.promise;
			this.cached.client = client;
			this.cached.db = db;
		} catch (e) {
			this.cached.promise = null;
			throw e;
		}
		this.logger.log("Connected");
		return { client: this.cached.client, db: this.cached.db };
	}

	getCollectionBuilder<T extends Document = Document>(
		collectionName: CollectionKey,
	): () => Promise<Collection<T>> {
		return async () => {
			const { db } = await this.connect();
			return db.collection<T>(collectionName);
		};
	}

	get cache(): MongoCache {
		return this.cached;
	}
}

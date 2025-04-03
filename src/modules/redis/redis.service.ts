import { getEnv } from "@/env";
import { InternalServerError } from "@/lib/errors";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
	private client: Redis;
	private logger = new Logger(RedisService.name);

	constructor() {
		const redisUrl = getEnv("REDIS_URL");
		try {
			this.client = new Redis(redisUrl, {
				retryStrategy: (times) => Math.min(times * 50, 2000),
				enableOfflineQueue: true,
			});

			this.client.on("connect", () => this.logger.log("Client connected"));
			this.client.on("error", (err) =>
				this.logger.error("Connection error:", err),
			);
		} catch (error) {
			throw new InternalServerError("Failed to initialize Redis connection.");
		}
	}

	async onModuleDestroy() {
		await this.client.quit();
		this.logger.log("Client disconnected");
	}

	async set<T>(key: string, value: T, expiry?: number): Promise<void> {
		const serializedValue = JSON.stringify(value);
		if (expiry) {
			await this.client.set(key, serializedValue, "EX", expiry);
		} else {
			await this.client.set(key, serializedValue);
		}
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key);
		if (value === null) return null;
		try {
			return JSON.parse(value) as T;
		} catch (error) {
			this.logger.error(`Failed to parse JSON for key "${key}":`, error);
			return null;
		}
	}

	async expire(key: string, seconds: number): Promise<boolean> {
		const result = await this.client.expire(key, seconds);
		return result === 1;
	}

	async del(key: string): Promise<number> {
		return await this.client.del(key);
	}

	getClient(): Redis {
		return this.client;
	}
}

import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { SignInIntent, SignUpIntent } from "./types";

export type RefreshTokenInput = {
	email: string;
	token: string;
	expiryInSeconds: number;
};

type Expiry = { expiryInSeconds: number };

export type CreateSignUpIntentInput = Omit<SignUpIntent, "type"> & Expiry;
export type CreateSignInIntentInput = Omit<SignInIntent, "type"> & Expiry;

@Injectable()
export class AuthRepository {
	constructor(private readonly redis: RedisService) {}

	async findIntent(token: string) {
		return this.redis.get<SignUpIntent | SignInIntent>(`intent:token:${token}`);
	}

	async createSignUpIntent({
		email,
		name,
		expiryInSeconds,
	}: CreateSignUpIntentInput) {
		const token = crypto.randomUUID();
		const intent: SignUpIntent = { type: "signup", email, name };

		await Promise.all([
			this.redis.set(`intent:email:${email}`, token, expiryInSeconds),
			this.redis.set(`intent:token:${token}`, intent, expiryInSeconds),
		]);

		return token;
	}

	async createSignInIntent({
		email,
		expiryInSeconds,
	}: CreateSignInIntentInput) {
		const token = crypto.randomUUID();
		const intent: SignInIntent = { type: "signin", email };

		await Promise.all([
			this.redis.set(`intent:email:${email}`, token, expiryInSeconds),
			this.redis.set(`intent:token:${token}`, intent, expiryInSeconds),
		]);

		return token;
	}

	async findToken(email: string) {
		const emailKey = `intent:email:${email}`;
		return this.redis.get<string>(emailKey);
	}

	async refreshToken({
		email,
		token,
		expiryInSeconds,
	}: RefreshTokenInput): Promise<void> {
		const emailKey = `intent:email:${email}`;
		const tokenKey = `intent:token:${token}`;
		await Promise.all([
			this.redis.expire(emailKey, expiryInSeconds),
			this.redis.expire(tokenKey, expiryInSeconds),
		]);
	}

	async cleanupIntent(token: string, email: string) {
		const emailKey = `intent:email:${email}`;
		const tokenKey = `intent:token:${token}`;

		try {
			await Promise.all([this.redis.del(emailKey), this.redis.del(tokenKey)]);
		} catch (error) {
			new Logger(AuthRepository.name).error(
				"Failed to expire intent keys",
				error,
			);
		}
	}
}

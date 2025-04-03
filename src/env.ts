/**
 * @todo - Implement NestJS ConfigService to group nested environment variables for easy access
 */

import { config } from "dotenv";

config();

export interface Environment {
	JWT_SECRET: string;
	MONGO_URI: string;
	NODE_ENV: "development" | "production" | "test";
	STORAGE_BUCKET: string;
	SMTP_HOST: string;
	SMTP_PORT: number;
	SMTP_USER: string;
	SMTP_PASS: string;
	REDIS_URL: string;
	REDIS_TOKEN: string;
	APP_URL: string;
	PORT: string;
	GMAPS_API_KEY: string;
	CLOUDINARY_CLOUD_NAME: string;
	CLOUDINARY_API_KEY: string;
	CLOUDINARY_API_SECRET: string;
}

export const getEnv = <K extends keyof Environment>(
	key: K,
	fallback?: Environment[K],
): Environment[K] => {
	const value = process.env[key];

	if (value === undefined) {
		if (fallback) {
			return fallback;
		}
		throw new Error(`Missing environment variable: ${key}.`);
	}

	return value as Environment[K];
};

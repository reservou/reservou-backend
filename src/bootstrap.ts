import * as cookiePlugin from "@fastify/cookie";
import staticPlugin from "@fastify/static";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { resolve } from "node:path";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./lib/filters/all-exceptions.filter";

export async function bootstrap(predefinedApp?: NestFastifyApplication) {
	const app =
		predefinedApp ??
		(await NestFactory.create<NestFastifyApplication>(
			AppModule,
			new FastifyAdapter(),
		));

	app.useGlobalPipes(new ValidationPipe());

	// Register the AllExceptionsFilter as a global filter
	app.useGlobalFilters(new AllExceptionsFilter());

	/**
	 * @todo Replace the options with environment variables
	 */
	await app.register(cookiePlugin, {});
	await app.register(staticPlugin, {
		root: resolve("./public"),
	});

	return app;
}

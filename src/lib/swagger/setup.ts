import { getEnv } from "@/env";
import { Logger } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupDocs(app: NestFastifyApplication) {
	const config = new DocumentBuilder()
		.setTitle("Reservou")
		.setDescription("API Platform for Reservou")
		.setVersion("1.0")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, documentFactory);
	new Logger(SwaggerModule.name).log(
		`API Docs available at ${getEnv("APP_URL")}/docs`,
	);
}

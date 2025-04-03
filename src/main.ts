import { Logger } from "@nestjs/common";
import { bootstrap } from "./bootstrap";
import { getEnv } from "./env";
import { setupDocs } from "./lib/swagger/setup";

async function run() {
	try {
		const app = await bootstrap();

		const url = getEnv("APP_URL");
		const port = Number.parseInt(getEnv("PORT", "8080"));

		setupDocs(app);

		await app.listen(port, () =>
			new Logger("NestApplication").log(`Application listening at ${url}`),
		);
	} catch (e) {
		/**
		 * @todo Implement crash report service
		 */
		console.error(e);
		process.exit(1);
	}
}

run();

import { AppModule } from "@/app.module";
import { bootstrap } from "@/bootstrap";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { AUTHORIZATION_COOKIE_NAME } from "../auth.constants";
import { AuthRepository } from "../auth.repository";
import { ConsumeMagicLink } from "../fn/consume-magic-link";
import { SignOutController } from "./sign-out.controller";

describe(`${SignOutController.name} (E2E)`, () => {
	let app: NestFastifyApplication;
	let authRepo: AuthRepository;
	let consumeMagicLink: ConsumeMagicLink;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);

		authRepo = moduleFixture.get(AuthRepository);
		consumeMagicLink = moduleFixture.get(ConsumeMagicLink);

		await bootstrap(app);
		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should clear the authorization cookie", async () => {
		const email = `lander${Date.now()}@mail.com`;
		const name = "Lander Gonzalez";

		const { authorizationToken } = await SignUpFixture.signUpSampleUser(
			{
				app,
				authRepo,
				consumeMagicLink,
			},
			{ email, name },
		);

		const response = await app.inject({
			method: "GET",
			url: "/sign-out",
			cookies: {
				[AUTHORIZATION_COOKIE_NAME]: `Bearer ${authorizationToken}`,
			},
		});

		expect(response.headers["set-cookie"]).toContain("Authorization=;");
	});
});

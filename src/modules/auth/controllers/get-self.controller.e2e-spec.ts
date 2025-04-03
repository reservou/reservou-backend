import { AppModule } from "@/app.module";
import { bootstrap } from "@/bootstrap";
import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { AUTHORIZATION_COOKIE_NAME } from "../auth.constants";
import { AuthRepository } from "../auth.repository";
import { ConsumeMagicLink } from "../fn/consume-magic-link";
import { GetSelfResponseDto } from "../outputs/get-self.output";
import { GetSelfController } from "./get-self.controller";

describe(`${GetSelfController.name} (E2E)`, () => {
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

	it("should return user information if authenticated", async () => {
		const email = `authenticated${Date.now()}@example.com`;
		const name = "Authenticated User";

		const { authorizationToken, ...user } =
			await SignUpFixture.signUpSampleUser(
				{ app, authRepo, consumeMagicLink },
				{ email, name },
			);

		const response = await app.inject({
			method: "GET",
			url: "/self",
			cookies: {
				[AUTHORIZATION_COOKIE_NAME]: `Bearer ${authorizationToken}`,
			},
		});

		expect(response.statusCode).toEqual(HttpStatus.OK);
		expect(response.json()).toEqual({
			data: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			error: null,
			message: "success",
		} as GetSelfResponseDto);
	});

	it("should return unauthorized if not authenticated", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/self",
		});

		expect(response.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
	});
});

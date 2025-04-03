import { AppModule } from "@/app.module";
import { bootstrap } from "@/bootstrap";
import { RedisService } from "@/modules/redis/redis.service";
import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignInFixture } from "@test/fixtures/sign-in.fixture";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { AuthRepository } from "../auth.repository";
import { ConsumeMagicLinkController } from "./consume-magic-link.controller";

describe(`${ConsumeMagicLinkController.name} (E2E)`, () => {
	let app: NestFastifyApplication;
	let redis: RedisService;
	let authRepo: AuthRepository;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);

		redis = app.get(RedisService);
		authRepo = app.get(AuthRepository);

		await bootstrap(app);

		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should not consume a expired token", async () => {
		const email = `james${Date.now()}@example.com`;
		const name = "James Example";
		const { statusCode } = await SignUpFixture.signUpWithMagicLink(app, {
			email,
			name,
		});
		expect(statusCode).toEqual(HttpStatus.CREATED);

		const token = await authRepo.findToken(email);
		expect(token).toBeTruthy();

		await authRepo.cleanupIntent(token as string, email);

		const response = await app.inject({
			method: "GET",
			url: `/magic-link/${token}`,
		});

		expect(response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
	});

	it("should set authorization cookie when user consumes magic link", async () => {
		const email = `albert${Date.now()}@example.com`;
		const name = "Albert Phillips";

		await SignUpFixture.signUpWithMagicLink(app, { email, name });

		const signUpToken = await authRepo.findToken(email);
		expect(signUpToken).toBeTruthy();

		const signUpResponse = await app.inject({
			method: "GET",
			url: `/magic-link/${signUpToken}`,
		});

		expect(signUpResponse.statusCode).toEqual(HttpStatus.OK);
		expect(signUpResponse.headers["set-cookie"]).toContain(
			"Authorization=Bearer",
		);

		await SignInFixture.signInWithMagicLink(app, { email });

		const signInToken = await authRepo.findToken(email);

		const signInResponse = await app.inject({
			method: "GET",
			url: `/magic-link/${signInToken}`,
		});

		expect(signInResponse.statusCode).toEqual(HttpStatus.OK);
		expect(signInResponse.headers["set-cookie"]).toContain(
			"Authorization=Bearer",
		);
	});
});

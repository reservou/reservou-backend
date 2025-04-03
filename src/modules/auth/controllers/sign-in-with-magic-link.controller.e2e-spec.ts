import { AppModule } from "@/app.module";
import { bootstrap } from "@/bootstrap";
import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { AuthRepository } from "../auth.repository";
import { ConsumeMagicLink } from "../fn/consume-magic-link";
import { SignInRequestDto } from "../inputs/sign-in.input";
import { SignInResponseDto } from "../outputs/sign-in.output";
import { SignInWithMagicLinkController } from "./sign-in-with-magic-link.controller";

describe(`${SignInWithMagicLinkController.name} (E2E)`, () => {
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

	it("should return 400 if the user attempts to sign in without a account", async () => {
		const response = await app.inject({
			method: "POST",
			url: "sign-in",
			payload: {
				email: "nonexistent@mail.com",
			} satisfies SignInRequestDto,
		});

		expect(response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
	});

	it("should send a access e-mail if the user exist and attempt to sign in", async () => {
		const email = `joseph${Date.now()}@example.com`;
		const name = "Joseph Example Junior";

		await SignUpFixture.signUpSampleUser(
			{ app, authRepo, consumeMagicLink },
			{
				email,
				name,
			},
		);

		const response = await app.inject({
			method: "POST",
			url: "/sign-in",
			payload: { email } satisfies SignInRequestDto,
		});

		expect(response.statusCode).toEqual(HttpStatus.CREATED);
		expect(response.json()).toEqual({
			data: expect.any(Object),
			error: null,
			message: expect.any(String),
		} as SignInResponseDto);
	});
});

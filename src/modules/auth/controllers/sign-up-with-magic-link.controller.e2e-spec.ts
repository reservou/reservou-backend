import { bootstrap } from "@/bootstrap";
import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../../app.module";
import {
	EMAIL_SENT_MESSAGE,
	MAGIC_LINK_SENT_FOR_EXISTING_ACCOUNT_MESSAGE,
} from "../auth.constants";
import { AuthRepository } from "../auth.repository";
import { ConsumeMagicLink } from "../fn/consume-magic-link";
import { SignUpRequestDto } from "../inputs/sign-up.input";
import { SignUpResponseDto } from "../outputs/sign-up.output";
import { SignUpWithMagicLinkController } from "./sign-up-with-magic-link.controller";

describe(`${SignUpWithMagicLinkController.name} (E2E)`, () => {
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

	it("should send a sign in magic link to the user if he's already registered", async () => {
		const email = `antony${Date.now()}@mail.com`;
		const name = "Antony Peterson";
		await SignUpFixture.signUpSampleUser(
			{ app, authRepo, consumeMagicLink },
			{
				email,
				name,
			},
		);

		const response = await SignUpFixture.signUpWithMagicLink(app, {
			email,
			name,
		});

		expect(response.statusCode).toEqual(HttpStatus.CREATED);
		expect(response.body).toEqual({
			data: {
				message: MAGIC_LINK_SENT_FOR_EXISTING_ACCOUNT_MESSAGE,
			},
			error: null,
			message: expect.any(String),
		} as SignUpResponseDto);
	});

	it("should send a magic link to the user", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/sign-up",
			payload: {
				name: "Joshua Ponte",
				email: `josua${Date.now()}@mail.com`,
			} satisfies SignUpRequestDto,
		});

		expect(response.statusCode).toBe(201);

		expect(response.json()).toEqual({
			data: {
				message: EMAIL_SENT_MESSAGE,
			},
			error: null,
			message: expect.any(String),
		} as SignUpResponseDto);
	});
});

import { AppModule } from "@/app.module";
import { bootstrap } from "@/bootstrap";
import { AUTHORIZATION_COOKIE_NAME } from "@/modules/auth/auth.constants";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { ConsumeMagicLink } from "@/modules/auth/fn/consume-magic-link";
import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { SignUpFixture } from "@test/fixtures/sign-up.fixture";
import { getSampleCreateHotelInput } from "@test/samples/hotel";
import { CreateHotelRequestDto } from "../inputs/create-hotel.input";
import { CreateHotelResponseDto } from "../outputs/create-hotel.output";
import { CreateHotelController } from "./create-hotel.controller";

describe(`${CreateHotelController.name} (E2E)`, () => {
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

	it("should return 409 and not create a hotel if the user already owns one", async () => {
		const { authorizationToken } = await signUpSampleUser();
		const body = getSampleCreateHotelInput();
		const createdResponse = await postHotel(authorizationToken, body);
		expect(createdResponse.statusCode).toEqual(HttpStatus.CREATED);

		const conflictingResponse = await postHotel(authorizationToken, body);
		expect(conflictingResponse.statusCode).toEqual(HttpStatus.CONFLICT);
	});

	it("should return 201 and the created hotel data", async () => {
		const { authorizationToken } = await signUpSampleUser();
		const body = getSampleCreateHotelInput();

		expect(body).toBeTruthy();

		const response = await postHotel(authorizationToken, body);

		expect(response.statusCode).toEqual(HttpStatus.CREATED);
		expect(response.json()).toEqual({
			data: {
				...body,
				id: expect.any(String),
				banner: null,
				photos: [],
				slug: expect.any(String),
			},
			error: null,
			message: expect.any(String),
		} satisfies CreateHotelResponseDto);
	});

	async function signUpSampleUser() {
		return SignUpFixture.signUpSampleUser(
			{
				app,
				authRepo,
				consumeMagicLink,
			},
			{
				email: `lester${Date.now()}@mail.com`,
				name: "Lester Bennignton",
			},
		);
	}

	async function postHotel(token: string, body: CreateHotelRequestDto) {
		return app.inject({
			url: "/hotels",
			method: "POST",
			cookies: {
				[AUTHORIZATION_COOKIE_NAME]: `Bearer ${token}`,
			},
			body,
		});
	}
});

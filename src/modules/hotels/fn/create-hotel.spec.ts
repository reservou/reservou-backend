import { MongoDB } from "@/lib/db";
import { ConflictError, InternalServerError } from "@/lib/errors";
import { MapsService } from "@/modules/maps/maps.service";
import { UsersRepository } from "@/modules/users/users.repository";
import { HotelsRepository } from "../hotels.repository";
import { CreateHotel, CreateHotelInput } from "./create-hotel";
import { GenerateHotelSlug } from "./generate-hotel-slug";

describe(`${CreateHotel.name} (E2E)`, () => {
	let createHotel: CreateHotel;
	let hotelsRepo: HotelsRepository;
	let usersRepo: UsersRepository;
	let mapsService: MapsService;
	let generateHotelSlug: GenerateHotelSlug;
	let mongoDB: MongoDB;

	beforeEach(() => {
		hotelsRepo = {
			insert: vi.fn(),
		} as unknown as HotelsRepository;

		usersRepo = {
			findById: vi.fn(),
		} as unknown as UsersRepository;

		mapsService = {
			geocodeAddress: vi.fn(),
		} as unknown as MapsService;

		generateHotelSlug = {
			execute: vi.fn(),
		} as unknown as GenerateHotelSlug;

		mongoDB = {
			startTransaction: vi.fn().mockResolvedValue({
				withTransaction: vi.fn(
					async (callback: (...args: unknown[]) => unknown) => {
						return await callback();
					},
				),
			}),
		} as unknown as MongoDB;

		createHotel = new CreateHotel(
			hotelsRepo,
			usersRepo,
			generateHotelSlug,
			mapsService,
			mongoDB,
		);
	});

	it("should throw internal server error if the function is invoked if a non existent user", async () => {
		const userId = "non-existent-user-id";
		usersRepo.findById = vi.fn().mockResolvedValue(null);

		await expect(
			createHotel.execute({} as CreateHotelInput, userId),
		).rejects.toThrow(InternalServerError);
	});

	it("should throw conflict error if the user already has a hotel", async () => {
		const userId = "user-id";
		const user = { id: userId, hotel: "hotel-id" };
		usersRepo.findById = vi.fn().mockResolvedValue(user);

		await expect(
			createHotel.execute({} as CreateHotelInput, userId),
		).rejects.toThrow(ConflictError);
	});
});

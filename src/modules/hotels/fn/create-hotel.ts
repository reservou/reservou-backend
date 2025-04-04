import { MongoDB } from "@/lib/db";
import { ConflictError, InternalServerError } from "@/lib/errors";
import { MapsService } from "@/modules/maps/maps.service";
import { UsersRepository } from "@/modules/users/users.repository";
import { Injectable } from "@nestjs/common";
import { HotelsRepository, HotelsRepositoryInsert } from "../hotels.repository";
import { Hotel, HotelCategory } from "../types";
import { buildAddressString } from "../utils/build-address-string";
import { GenerateHotelSlug } from "./generate-hotel-slug";

export type CreateHotelInput = {
	name: string;
	description: string;
	amenities: string[];
	location: {
		address: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};
	contact: {
		email: string;
		phone: string;
		website?: string;
	};
	category: HotelCategory;
};

@Injectable()
export class CreateHotel {
	constructor(
		private readonly hotelsRepo: HotelsRepository,
		private readonly usersRepo: UsersRepository,
		private readonly generateHotelSlug: GenerateHotelSlug,
		private readonly mapsService: MapsService,
		private readonly mongoDB: MongoDB,
	) {}

	async execute(input: CreateHotelInput, userId: string): Promise<Hotel> {
		const userAttemptingToCreate = await this.usersRepo.findById(userId);
		if (!userAttemptingToCreate) {
			throw new InternalServerError(
				"Create hotel route should be protected against unauthorized requests",
				{ userId },
			);
		}

		if (userAttemptingToCreate.hotel) {
			throw new ConflictError(
				"Você já possui um hotel associado, entre em contato com suporte para mais informações.",
			);
		}

		const { name, category } = input;
		const slug = await this.generateHotelSlug.execute({ name, category });
		const { lat, lng } = await this.mapsService.geocodeAddress(
			buildAddressString(input.location),
		);

		const insertHotelInput: HotelsRepositoryInsert = {
			...input,
			slug,
			banner: null,
			geolocation: {
				type: "Point",
				coordinates: [lng, lat],
			},
			photos: [],
		};

		const session = await this.mongoDB.startTransaction({});

		const { id } = await session.withTransaction(async (session) => {
			const { id } = await this.hotelsRepo.insert(insertHotelInput, session);
			await this.usersRepo.update(userAttemptingToCreate.id, { hotel: id });

			return { id };
		});

		const { geolocation, ...output } = insertHotelInput;
		return {
			id,
			...output,
		} satisfies Hotel;
	}
}

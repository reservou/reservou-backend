import { MongoDB } from "@/lib/db";
import { Projection } from "@/lib/db/types";
import { InternalServerError } from "@/lib/errors";
import { Injectable } from "@nestjs/common";
import { ClientSession, Collection, Document, ObjectId, WithId } from "mongodb";
import { Hotel } from "./types";

type HotelsCollection = Collection<HotelDocument>;

export type HotelDocument = Document &
	Omit<Hotel, "id"> & {
		geolocation: {
			type: "Point";
			coordinates: [number, number];
		};
	};

export type HotelsRepositoryInsert = HotelDocument;

export type HotelUpdate = Partial<HotelsRepositoryInsert>;

@Injectable()
export class HotelsRepository {
	private collection: () => Promise<HotelsCollection>;

	constructor(private readonly mongoDB: MongoDB) {
		this.collection = this.mongoDB.getCollectionBuilder<HotelDocument>("users");
	}

	async findBySlug(
		slug: string,
		session?: ClientSession,
	): Promise<Hotel | null> {
		const coll = await this.collection();

		const hotelFound = await coll.findOne(
			{
				slug,
			},
			{ session },
		);

		if (!hotelFound) {
			return null;
		}

		return {
			id: hotelFound._id.toHexString(),
			...hotelFound,
		};
	}

	async findNearby(
		coordinates: [number, number],
		maxDistance = 5000,
		limit = 10,
		session?: ClientSession,
	): Promise<Hotel[]> {
		const coll = await this.collection();

		const hotels = await coll
			.aggregate<WithId<HotelDocument>>(
				[
					{
						$geoNear: {
							near: {
								type: "Point",
								coordinates: coordinates,
							},
							distanceField: "distance",
							maxDistance: maxDistance,
							spherical: true,
							limit: limit,
						},
					},
					{
						$project: {
							_id: 1,
							name: 1,
							slug: 1,
							description: 1,
							location: 1,
							contact: 1,
							category: 1,
							banner: 1,
							photos: 1,
							amenities: 1,
						} satisfies Projection<HotelDocument>,
					},
				],
				{ session },
			)
			.toArray();

		return hotels.map(({ _id, ...hotel }) => ({
			id: _id.toHexString(),
			...hotel,
		}));
	}

	async findById(id: string): Promise<Hotel | null> {
		const coll = await this.collection();

		const documentFound = await coll.findOne({
			_id: new ObjectId(id),
		});

		if (!documentFound) {
			return null;
		}

		const { _id, geolocation, ...hotel } = documentFound;

		return { id, ...hotel };
	}

	async insert(input: HotelDocument, session?: ClientSession) {
		const coll = await this.collection();
		const { insertedId } = await coll.insertOne(
			{
				...input,
			},
			{ session },
		);

		if (!insertedId) {
			throw new InternalServerError("Failed to insert hotel", { input });
		}

		return {
			id: insertedId.toHexString(),
		};
	}

	async update(id: string, data: HotelUpdate, session?: ClientSession) {
		const coll = await this.collection();

		const { modifiedCount } = await coll.updateOne(
			{
				_id: new ObjectId(id),
			},
			data,
			{ ignoreUndefined: true, session },
		);

		return modifiedCount > 0;
	}

	async destroy(id: string, session?: ClientSession) {
		const coll = await this.collection();

		const { deletedCount } = await coll.deleteOne(
			{ _id: new ObjectId(id) },
			{ session },
		);

		return deletedCount > 0;
	}
}

import { MongoDB } from "@/lib/db";
import { Injectable } from "@nestjs/common";
import { Collection, Document, ObjectId } from "mongodb";
import { User } from "./types";

export type UsersRepositoryInsert = Omit<User, "id">;

export type UsersRepositoryUpdate = Partial<Omit<User, "id">>;

type UserDocument = Document &
	Omit<User, "id" | "hotel"> & {
		hotel: ObjectId | null;
	};

type UserCollection = Collection<UserDocument>;

@Injectable()
export class UsersRepository {
	private collection: () => Promise<UserCollection>;

	constructor(private readonly mongoDB: MongoDB) {
		this.collection = this.mongoDB.getCollectionBuilder<UserDocument>("users");
	}

	async insert(data: UsersRepositoryInsert): Promise<User> {
		const { email, name, plan, email_verified } = data;

		const coll = await this.collection();
		const result = await coll.insertOne({
			email,
			name,
			plan,
			email_verified,
			hotel: null,
		});
		return {
			id: result.insertedId.toHexString(),
			email,
			name,
			plan,
			email_verified,
			hotel: null,
		};
	}

	async findByEmail(email: string): Promise<User | null> {
		const coll = await this.collection();
		const user = await coll.findOne({ email });
		if (!user) return null;
		return {
			...user,
			id: user._id.toHexString(),
			hotel: user.hotel?.toHexString() ?? null,
		};
	}

	async findById(id: string): Promise<User | null> {
		const coll = await this.collection();
		const user = await coll.findOne({ _id: new ObjectId(id) });
		if (!user) return null;
		return {
			...user,
			id: user._id.toHexString(),
			hotel: user.hotel?.toHexString() ?? null,
		};
	}

	async update(id: string, data: UsersRepositoryUpdate): Promise<User | null> {
		const coll = await this.collection();
		const result = await coll.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{
				$set: {
					...data,
					hotel: data.hotel
						? new ObjectId(data.hotel)
						: (data.hotel as null | undefined),
				},
			},
			{ returnDocument: "after", ignoreUndefined: true },
		);
		if (!result?.value) return null;
		return { ...result.value, id: result.value._id.toHexString() };
	}

	async destroy(id: string): Promise<boolean> {
		const coll = await this.collection();
		const result = await coll.deleteOne({ _id: new ObjectId(id) });
		return result.deletedCount === 1;
	}
}

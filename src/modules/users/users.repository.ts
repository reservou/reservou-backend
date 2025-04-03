import { MongoDB } from "@/lib/db";
import { Injectable } from "@nestjs/common";
import { Collection, Document, ObjectId } from "mongodb";

export class User {
	id!: string;
	name!: string;
	email!: string;
	plan!: "BASIC" | "PRO";
	email_verified?: Date;
}

export type UserInsert = Omit<User, "id">;

type UserDocument = Document & Omit<User, "id">;
type UserCollection = Collection<UserDocument>;

@Injectable()
export class UsersRepository {
	private collection: () => Promise<UserCollection>;

	constructor(private readonly mongoDB: MongoDB) {
		this.collection = this.mongoDB.getCollectionBuilder<UserDocument>("users");
	}

	async insert(data: UserInsert): Promise<User> {
		const coll = await this.collection();
		const result = await coll.insertOne(data);
		return { ...data, id: result.insertedId.toHexString() };
	}

	async findByEmail(email: string): Promise<User | null> {
		const coll = await this.collection();
		const user = await coll.findOne({ email });
		if (!user) return null;
		return { ...user, id: user._id.toHexString() };
	}

	async findById(id: string): Promise<User | null> {
		const coll = await this.collection();
		const user = await coll.findOne({ _id: new ObjectId(id) });
		if (!user) return null;
		return { ...user, id: user._id.toHexString() };
	}

	async update(id: string, data: Partial<UserInsert>): Promise<User | null> {
		const coll = await this.collection();
		const result = await coll.findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: data },
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

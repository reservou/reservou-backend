export class User {
	id!: string;
	name!: string;
	email!: string;
	plan!: "BASIC" | "PRO";
	email_verified?: Date;
}

export type SignUpIntent = {
	type: "signup";
	name: string;
	email: string;
};

export type SignInIntent = {
	type: "signin";
	email: string;
};

export class AuthorizationTokenPayload {
	uid!: string;
}

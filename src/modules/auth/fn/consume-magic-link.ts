import { BadRequestError } from "@/lib/errors";
import { JwtService } from "@/modules/jwt/jwt.service";
import { CheckUserUniqueConstraints } from "@/modules/users/fn/check-user-unique-constraints";
import { UsersRepository } from "@/modules/users/users.repository";
import { Injectable } from "@nestjs/common";
import { AuthRepository } from "../auth.repository";
import { SignInIntent, SignUpIntent } from "../types";

export type MagicLinkOutput = {
	id: string;
	name: string;
	email: string;
	authorizationToken: string;
};

export type AccessTokenPayload = {
	/**
	 * User ID
	 */
	uid: string;
	/**
	 * User's hotel ID, null if user is not a hotel owner
	 */
	hid: string | null;
};

/**
 * Magic links are relying on intent being persisted in redis,
 * with a `intent:email:${email}` and `intent:token:${token}`,
 * being the email key used to find the token ID sent to user's email.
 */

@Injectable()
export class ConsumeMagicLink {
	constructor(
		private readonly authRepo: AuthRepository,
		private readonly usersRepo: UsersRepository,
		private readonly jwtService: JwtService,
		private readonly checkUserUniqueConstraints: CheckUserUniqueConstraints,
	) {}

	async execute(token: string): Promise<MagicLinkOutput> {
		const intent = await this.authRepo.findIntent(token);

		if (!intent) {
			throw new BadRequestError(
				"Link inválido ou expirado, faça login novamente.",
			);
		}

		const { email } = intent;
		const userFound = await this.usersRepo.findByEmail(email);

		if (userFound) {
			const authorizationToken = this.jwtService.sign({
				uid: userFound.id,
				hid: userFound.hotel,
			} satisfies AccessTokenPayload);

			this.authRepo.cleanupIntent(token, email);

			return {
				id: userFound.id,
				name: userFound.name,
				email: userFound.email,
				authorizationToken,
			};
		}

		/**
		 * @todo - Instrumentation
		 * This should not happen since we're not generating tokens for
		 * signing in a user that doesn't exist, use `captureException(e)`
		 */
		if (this.isSignInIntent(intent)) {
			throw new BadRequestError(
				"Usuário não cadastrado, faça login para continuar",
			);
		}

		const { name } = intent;

		await this.checkUserUniqueConstraints.execute({ email });

		const user = await this.usersRepo.insert({
			email,
			name,
			plan: "BASIC",
			hotel: null,
			email_verified: new Date(),
		});

		const authorizationToken = this.jwtService.sign({
			uid: user.id,
			hid: null,
		} satisfies AccessTokenPayload);

		this.authRepo.cleanupIntent(token, email);

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			authorizationToken,
		};
	}

	private isSignInIntent(
		intent: SignUpIntent | SignInIntent,
	): intent is SignInIntent {
		return intent.type === "signin";
	}
}

import { AuthRepository } from "@/modules/auth/auth.repository";
import { ConsumeMagicLink } from "@/modules/auth/fn/consume-magic-link";
import { SignUpRequestDto } from "@/modules/auth/inputs/sign-up.input";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { RawServerDefault } from "fastify";

export type SignUpSampleUserDeps = {
	authRepo: AuthRepository;
	app: NestFastifyApplication;
	consumeMagicLink: ConsumeMagicLink;
};

export class SignUpFixture {
	/**
	 * Attempts to sign up a user by HTTP request injection
	 */
	static async signUpWithMagicLink(
		app: NestFastifyApplication<RawServerDefault>,
		payload: SignUpRequestDto,
	): Promise<{ statusCode: number; body: unknown }> {
		const response = await app.inject({
			method: "POST",
			url: "/sign-up",
			payload,
		});

		return {
			statusCode: response.statusCode,
			body: response.json(),
		};
	}

	static async signUpSampleUser(
		deps: SignUpSampleUserDeps,
		payload: SignUpRequestDto,
	) {
		const { app, authRepo, consumeMagicLink } = deps;
		await SignUpFixture.signUpWithMagicLink(app, payload);
		const token = await authRepo.findToken(payload.email);
		if (!token) {
			throw new Error("Could not retrieve token when signin up sample user");
		}

		return await consumeMagicLink.execute(token);
	}
}

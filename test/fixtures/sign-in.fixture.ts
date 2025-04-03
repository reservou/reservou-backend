import { SignInRequestDto } from "@/modules/auth/inputs/sign-in.input";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { RawServerDefault } from "fastify";

export class SignInFixture {
	/**
	 * Attempts to sign in a user by HTTP request injection
	 */
	static async signInWithMagicLink(
		app: NestFastifyApplication<RawServerDefault>,
		payload: SignInRequestDto,
	): Promise<{ statusCode: number; body: unknown }> {
		const response = await app.inject({
			method: "POST",
			url: "/sign-in",
			payload,
		});

		return {
			statusCode: response.statusCode,
			body: response.json(),
		};
	}
}

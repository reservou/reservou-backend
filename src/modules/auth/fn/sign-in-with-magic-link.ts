import { getEnv } from "@/env";
import { BadRequestError } from "@/lib/errors";
import { CONFIRMATION_TOKEN_EXPIRY_IN_MINUTES } from "@/modules/auth/auth.constants";
import { MailerService } from "@/modules/mailer/mailer.service";
import { UsersRepository } from "@/modules/users/users.repository";
import { Injectable } from "@nestjs/common";
import { AuthRepository } from "../auth.repository";

export type SignInWithMagicLinkInput = {
	email: string;
};

@Injectable()
export class SignInWithMagicLink {
	constructor(
		private readonly mailerService: MailerService,
		private readonly usersRepo: UsersRepository,
		private readonly authRepo: AuthRepository,
	) {}

	async execute(input: SignInWithMagicLinkInput): Promise<void> {
		const { email } = input;
		const user = await this.usersRepo.findByEmail(email);

		if (!user) {
			throw new BadRequestError(
				"Usuário não encontrado. Por favor, cadastre-se.",
			);
		}

		const token = await this.resolveConfirmationToken(email);
		await this.sendConfirmationMail(email, token);
	}

	private async resolveConfirmationToken(email: string): Promise<string> {
		const expiryInSeconds = CONFIRMATION_TOKEN_EXPIRY_IN_MINUTES * 60;
		const previousToken = await this.authRepo.findToken(email);

		if (previousToken) {
			await this.authRepo.refreshToken({
				email,
				token: previousToken,
				expiryInSeconds,
			});
			return previousToken;
		}

		const token = await this.authRepo.createSignInIntent({
			email,
			expiryInSeconds,
		});
		return token;
	}

	private async sendConfirmationMail(
		email: string,
		token: string,
	): Promise<void> {
		const appUrl = getEnv("APP_URL");
		const magicLink = `${appUrl}/access/${token}`;

		const result = await this.mailerService.sendMail({
			to: email,
			from: "hey@reservou.xyz",
			subject: "Acesse sua conta",
			text: `Acesse sua conta por esse link: ${magicLink}`,
		});

		if (!result.success) {
			throw new Error("Failed to send confirmation email");
		}
	}
}

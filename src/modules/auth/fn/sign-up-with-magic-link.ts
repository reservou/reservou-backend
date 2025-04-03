import { getEnv } from "@/env";
import { InternalServerError } from "@/lib/errors";
import { CONFIRMATION_TOKEN_EXPIRY_IN_MINUTES } from "@/modules/auth/auth.constants";
import { MailerService } from "@/modules/mailer/mailer.service";
import { CheckUserUniqueConstraints } from "@/modules/users/fn/check-user-unique-constraints";
import { Injectable } from "@nestjs/common";
import { AuthRepository } from "../auth.repository";
import { SignUpIntent } from "../types";

@Injectable()
export class SignUpWithMagicLink {
	constructor(
		private readonly authRepo: AuthRepository,
		private readonly mailerService: MailerService,
		private readonly checkUserUniqueConstraints: CheckUserUniqueConstraints,
	) {}

	async execute(input: SignUpIntent): Promise<void> {
		const { email, name } = input;
		await this.checkUserUniqueConstraints.execute({ email });
		const token = await this.resolveConfirmationToken(email, name);
		await this.sendConfirmationMail(email, token);
	}

	private async resolveConfirmationToken(
		email: string,
		name: string,
	): Promise<string> {
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

		const token = await this.authRepo.createSignUpIntent({
			email,
			name,
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
			subject: "Confirme seu cadastro",
			text: `Acesse sua conta por esse link: ${magicLink}`,
		});

		if (!result.success) {
			throw new InternalServerError("Failed to send confirmation email");
		}
	}
}

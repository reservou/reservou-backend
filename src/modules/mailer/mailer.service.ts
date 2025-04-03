import { getEnv } from "@/env";
import { Injectable, Logger } from "@nestjs/common";

import { Transporter, createTransport } from "nodemailer";

export type MailOptions = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
};

@Injectable()
export class MailerService {
	private transport: Transporter;
	private logger: Logger;

	constructor() {
		this.transport = createTransport({
			host: getEnv("SMTP_HOST"),
			port: getEnv("SMTP_PORT"),
			auth: {
				user: getEnv("SMTP_USER"),
				pass: getEnv("SMTP_PASS"),
			},
		});

		this.logger = new Logger("MailerService");
	}

	async sendMail({ to, subject, text, html, from }: MailOptions) {
		const nodeEnv = getEnv("NODE_ENV");
		if (nodeEnv !== "production") {
			this.logger.warn(
				`Email sending is disabled in ${nodeEnv} mode. Simulated send to: ${to}\n`,
			);
			this.logger.debug({ to, subject, text, html, from });

			return {
				success: true,
				message: `Simulated email send in ${nodeEnv} mode`,
			};
		}

		try {
			const mailOptions = {
				from,
				to,
				subject,
				text,
				html,
			};

			const info = await this.transport.sendMail(mailOptions);
			this.logger.log(`Email sent: ${info.messageId}`);

			return {
				success: true,
				messageId: info.messageId,
				response: info.response,
			};
		} catch (error) {
			this.logger.error("Error sending email:", error);
			return {
				success: false,
				error,
			};
		}
	}
}

import { ConflictError } from "@/lib/errors";
import { EMAIL_IN_USE_MSG } from "@/modules/users/users.constants";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	EMAIL_SENT_MESSAGE,
	MAGIC_LINK_SENT_FOR_EXISTING_ACCOUNT_MESSAGE,
} from "../auth.constants";
import { Public } from "../decorators/public.decorator";
import { SignInWithMagicLink } from "../fn/sign-in-with-magic-link";
import { SignUpWithMagicLink } from "../fn/sign-up-with-magic-link";
import { SignUpRequestDto } from "../inputs/sign-up.input";
import { SignUpResponseDto } from "../outputs/sign-up.output";

@Public()
@ApiTags("Auth")
@Controller("sign-up")
export class SignUpWithMagicLinkController {
	constructor(
		private readonly signUpWithMagicLink: SignUpWithMagicLink,
		private readonly signinWithMagicLink: SignInWithMagicLink,
	) {}

	@Post()
	@ApiOperation({
		summary: "Sends a magic link to the user's email",
	})
	@ApiCreatedResponse({
		description: "Magic link sent successfully",
		type: SignUpResponseDto,
	})
	async signUp(@Body() input: SignUpRequestDto): Promise<SignUpResponseDto> {
		try {
			await this.signUpWithMagicLink.execute({ type: "signup", ...input });
		} catch (error) {
			if (
				error instanceof ConflictError &&
				error.message === EMAIL_IN_USE_MSG
			) {
				await this.signinWithMagicLink.execute({ email: input.email });
				return new SignUpResponseDto(
					{
						message: MAGIC_LINK_SENT_FOR_EXISTING_ACCOUNT_MESSAGE,
					},
					"Sucesso",
				);
			}
			throw error;
		}
		return new SignUpResponseDto({ message: EMAIL_SENT_MESSAGE }, "Sucesso");
	}
}

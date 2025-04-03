import { Body, Controller, Post } from "@nestjs/common";
import {
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { SignInWithMagicLink } from "../fn/sign-in-with-magic-link";
import { SignInRequestDto } from "../inputs/sign-in.input";
import { SignInResponseDto } from "../outputs/sign-in.output";
import { Public } from "../decorators/public.decorator";

@Public()
@ApiTags("Auth")
@Controller("sign-in")
export class SignInWithMagicLinkController {
	constructor(private readonly signInWithMagicLink: SignInWithMagicLink) {}

	@Post()
	@ApiOperation({ summary: "Sends a confirmation token to the user's e-mail." })
	@ApiOkResponse({ type: SignInResponseDto })
	@ApiUnauthorizedResponse()
	async signIn(
		@Body() { email }: SignInRequestDto,
	): Promise<SignInResponseDto> {
		await this.signInWithMagicLink.execute({ email });
		return new SignInResponseDto(
			{ message: "Feito! te enviamos um e-mail de acesso." },
			"Feito! te enviamos um e-mail de acesso.",
		);
	}
}

import { type ErrorObject, HttpError, InternalServerError } from "@/lib/errors";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { BaseResponseDto } from "../outputs/base.output";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<FastifyReply>();
		const request = host.switchToHttp().getRequest<FastifyRequest>();

		const { error, status } = this.processException(exception, request);

		response
			.status(status)
			.send(new BaseResponseDto(null, error.message, error));
	}

	private processException(
		exception: unknown,
		request: FastifyRequest,
	): { error: ErrorObject; status: number } {
		if (exception instanceof HttpError) {
			if (exception instanceof InternalServerError) {
				this.logger.error(exception);
			}
			return { error: exception.toJSON(), status: exception.statusCode };
		}

		if (exception instanceof HttpException) {
			const message = exception.message || "An error occurred";
			const status = exception.getStatus();
			return {
				error: new HttpError({
					statusCode: status,
					status: "error",
					message,
				}).toJSON(),
				status,
			};
		}

		this.logger.error(exception);
		const error = new InternalServerError(
			exception instanceof Error ? exception.message : "Unknown error",
			{ exception, url: request.url },
		);
		return { error: error.toJSON(), status: HttpStatus.INTERNAL_SERVER_ERROR };
	}
}

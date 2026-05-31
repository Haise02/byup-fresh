import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Si è verificato un errore interno.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && 'message' in res) {
        message = Array.isArray((res as any).message)
          ? (res as any).message.join(', ')
          : (res as any).message;
        code = (res as any).error || HttpStatus[status];
      } else {
        message = res as string;
        code = HttpStatus[status];
      }
    } else if (this.isHttpishError(exception)) {
      // Errori che non sono HttpException ma portano comunque uno status HTTP:
      // tipicamente body-parser (JSON malformato → 400, payload troppo grande
      // → 413, charset/content-type non supportato → 415). Senza questo ramo
      // finirebbero nel catch-all sotto e tornerebbero un 500 fuorviante.
      const err = exception as { status?: number; statusCode?: number; message?: string };
      status = (err.status ?? err.statusCode) as number;
      code = HttpStatus[status] ?? 'ERROR';
      message = err.message ?? 'Richiesta non valida.';
    } else {
      this.logger.error(exception);
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }

  /** Un errore "http-ish" non-HttpException: ha uno status numerico nel range
   *  client/server (es. gli errori di body-parser). */
  private isHttpishError(exception: unknown): boolean {
    if (typeof exception !== 'object' || exception === null) return false;
    const status = (exception as { status?: unknown; statusCode?: unknown }).status
      ?? (exception as { statusCode?: unknown }).statusCode;
    return typeof status === 'number' && status >= 400 && status <= 599;
  }
}

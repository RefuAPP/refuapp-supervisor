import { User } from './user';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { match } from 'ts-pattern';

export enum GetUserErrors {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVER_INCORRECT_DATA_FORMAT_ERROR = 'SERVER_INCORRECT_DATA_FORMAT_ERROR',
  CLIENT_SEND_DATA_ERROR = 'CLIENT_SEND_DATA_ERROR',
  PROGRAMMER_SEND_DATA_ERROR = 'PROGRAMMER_SEND_DATA_ERROR',
}

export type GetUserResponse =
  | {
      status: 'correct';
      data: User;
    }
  | {
      status: 'error';
      error: GetUserErrors;
    };

export namespace GetUserErrors {
  export function from(err: HttpErrorResponse): GetUserErrors | never {
    return match(err.status)
      .returnType<GetUserErrors>()
      .with(0, () => {
        throw new Error('You are offline or the server is down.');
      })
      .with(HttpStatusCode.Unauthorized, () => GetUserErrors.UNAUTHORIZED)
      .with(HttpStatusCode.Forbidden, () => GetUserErrors.FORBIDDEN)
      .with(HttpStatusCode.NotFound, () => GetUserErrors.NOT_FOUND)
      .with(
        HttpStatusCode.UnprocessableEntity,
        () => GetUserErrors.PROGRAMMER_SEND_DATA_ERROR,
      )
      .otherwise(() => GetUserErrors.UNKNOWN_ERROR);
  }
}

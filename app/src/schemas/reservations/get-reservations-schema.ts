import { Reservation } from './reservation';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { match } from 'ts-pattern';

export enum GetReservationsErrors {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  SERVER_INCORRECT_DATA_FORMAT_ERROR = 'SERVER_INCORRECT_DATA_FORMAT_ERROR',
  CLIENT_SEND_DATA_ERROR = 'CLIENT_SEND_DATA_ERROR',
  PROGRAMMER_SEND_DATA_ERROR = 'PROGRAMMER_SEND_DATA_ERROR',
}

export type GetReservationsResponse =
  | {
      status: 'correct';
      data: Reservation[];
    }
  | {
      status: 'error';
      error: GetReservationsErrors;
    };

export namespace GetReservationsErrors {
  export function from(err: HttpErrorResponse): GetReservationsErrors | never {
    return match(err.status)
      .returnType<GetReservationsErrors>()
      .with(0, () => {
        throw new Error('You are offline or the server is down.');
      })
      .with(
        HttpStatusCode.Unauthorized,
        () => GetReservationsErrors.UNAUTHORIZED
      )
      .with(HttpStatusCode.Forbidden, () => GetReservationsErrors.FORBIDDEN)
      .with(HttpStatusCode.NotFound, () => GetReservationsErrors.NOT_FOUND)
      .with(
        HttpStatusCode.UnprocessableEntity,
        () => GetReservationsErrors.PROGRAMMER_SEND_DATA_ERROR
      )
      .otherwise(() => GetReservationsErrors.UNKNOWN_ERROR);
  }
}

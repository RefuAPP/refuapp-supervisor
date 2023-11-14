import { Injectable } from '@angular/core';
import { isValidNight, Night } from '../../../schemas/reservations/night';
import { catchError, map, Observable, ObservableInput, of, retry } from 'rxjs';
import {
  GetReservationsErrors,
  GetReservationsResponse,
} from '../../../schemas/reservations/get-reservations-schema';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Reservation,
  ReservationPattern,
} from '../../../schemas/reservations/reservation';
import { isMatching } from 'ts-pattern';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor(private http: HttpClient) {}

  getReservationsFrom(night: Night): Observable<GetReservationsResponse> {
    if (!isValidNight(night))
      return of({
        status: 'error',
        error: GetReservationsErrors.CLIENT_SEND_DATA_ERROR,
      });
    return this.getReservationsFromApi(night);
  }

  getReservationsFromApi(night: Night): Observable<GetReservationsResponse> {
    const endpoint = this.getReservationEndpoint(night);
    return this.http.get<Reservation[]>(endpoint).pipe(
      map<Reservation[], GetReservationsResponse | Error>(
        (reservations: Reservation[]) => {
          if (isMatching(ReservationPattern, reservations.values()))
            return { status: 'correct', data: reservations };
          return {
            status: 'error',
            error: GetReservationsErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
          };
        },
      ),
      catchError<GetReservationsResponse | Error, ObservableInput<any>>(
        (err: HttpErrorResponse) =>
          of({
            status: 'error',
            error: GetReservationsErrors.from(err),
          }),
      ),
      retry(3),
    );
  }

  private getReservationEndpoint(night: Night): string {
    return `${environment.API}/reservations/refuge/${night.refugeId}/year/${night.year}/month/${night.month}/day/${night.day}/`;
  }
}

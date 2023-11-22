import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  distinctUntilChanged,
  map,
  mergeMap,
  Observable,
  ObservableInput,
  of,
  retry,
  share,
  timer,
} from 'rxjs';
import {
  GetAllRefugesErrors,
  GetAllRefugesResponse,
} from '../../../schemas/refuge/get-all-refuges-schema';
import {
  isValidId,
  Refuge,
  RefugePattern,
} from '../../../schemas/refuge/refuge';
import { isMatching } from 'ts-pattern';
import { environment } from '../../../environments/environment';
import {
  GetRefugeFromIdErrors,
  GetRefugeResponse,
} from '../../../schemas/refuge/get-refuge-schema';

@Injectable({
  providedIn: 'root',
})
export class RefugeService {
  private getRefugesConnection?: Observable<GetAllRefugesResponse>;

  constructor(private http: HttpClient) {}

  getRefuges(): Observable<GetAllRefugesResponse> {
    if (!this.getRefugesConnection) {
      this.getRefugesConnection = timer(0, 3_000)
        .pipe(
          mergeMap(() => this.getAllRefugesFromApi()),
          distinctUntilChanged(
            (a, b) => JSON.stringify(a) === JSON.stringify(b)
          )
        )
        .pipe(share());
    }
    return this.getRefugesConnection;
  }

  getRefugeFrom(id: string): Observable<GetRefugeResponse> {
    if (!isValidId(id))
      return of({
        status: 'error',
        error: GetRefugeFromIdErrors.CLIENT_SEND_DATA_ERROR,
      });
    return this.getRefugeFromApi(id);
  }

  getImageUrlFor(refuge: Refuge): string {
    return `${environment.API}/static/images/refuges/${refuge.image}`;
  }

  private getAllRefugesFromApi(): Observable<GetAllRefugesResponse> {
    const endpoint = this.getAllRefugesEndpoint();
    return this.http.get<Refuge[]>(endpoint).pipe(
      map<Refuge[], GetAllRefugesResponse | Error>((refuges: Refuge[]) => {
        if (isMatching(RefugePattern, refuges.values()))
          return { status: 'correct', data: refuges };
        return {
          status: 'error',
          error: GetAllRefugesErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
        };
      }),
      catchError<GetAllRefugesResponse | Error, ObservableInput<any>>(
        (err: HttpErrorResponse) =>
          of({
            status: 'error',
            error: GetAllRefugesErrors.from(err),
          })
      ),
      retry(3)
    );
  }

  private getRefugeFromApi(id: string): Observable<GetRefugeResponse> {
    const endpoint = this.getRefugeFromIdEndpoint(id);
    return this.http.get<Refuge>(endpoint).pipe(
      map<Refuge, GetRefugeResponse | Error>((refuge: Refuge) => {
        if (isMatching(RefugePattern, refuge))
          return { status: 'correct', data: refuge };
        return {
          status: 'error',
          error: GetRefugeFromIdErrors.SERVER_INCORRECT_DATA_FORMAT_ERROR,
        };
      }),
      catchError<GetRefugeResponse | Error, ObservableInput<any>>(
        (err: HttpErrorResponse) =>
          of({
            status: 'error',
            error: GetRefugeFromIdErrors.from(err),
          })
      ),
      retry(3)
    );
  }

  private getAllRefugesEndpoint(): string {
    return `${environment.API}/refuges/`;
  }

  private getRefugeFromIdEndpoint(id: string): string {
    return `${environment.API}/refuges/${id}`;
  }
}

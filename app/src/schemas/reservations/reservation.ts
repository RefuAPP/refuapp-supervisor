import { P } from 'ts-pattern';

export type Reservation = {
  user_id: string;
  refuge_id: string;
  night: {
    day: number;
    month: number;
    year: number;
  };
  id: string;
};

export const ReservationPattern: P.Pattern<Reservation> = {};

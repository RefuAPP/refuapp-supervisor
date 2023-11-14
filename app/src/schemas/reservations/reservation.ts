import { P } from 'ts-pattern';

export type Reservation = {
  userId: string;
  refugeId: string;
  night: {
    day: number;
    month: number;
    year: number;
  };
  id: string;
};

export const ReservationPattern: P.Pattern<Reservation> = {};

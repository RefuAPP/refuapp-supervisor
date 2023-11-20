import { P } from 'ts-pattern';

export type User = {
  username: string;
  phone_number: string;
  emergency_number: string;
  id: string;
};

export const UserPattern: P.Pattern<User> = {};

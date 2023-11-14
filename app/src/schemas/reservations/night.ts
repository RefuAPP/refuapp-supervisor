import { isValidId } from '../refuge/refuge';

export type Night = {
  day: number;
  month: number;
  year: number;
  refugeId: string;
};

export function isValidNight(night: Night): boolean {
  return isValidId(night.refugeId);
}

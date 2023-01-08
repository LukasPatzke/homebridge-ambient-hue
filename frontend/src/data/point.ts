import { Point } from '../api.types';
import { fetcher } from './fetcher';

export const update = async (point: Partial<Point>, resource: string) => {
  return fetcher(`/api/${resource}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(point),
  }) as Promise<Point>;
};

export const deletePoint = async (point: Partial<Point>, resource: string) => {
  return fetcher(`/api/${resource}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(point),
  }) as Promise<Point>;
};

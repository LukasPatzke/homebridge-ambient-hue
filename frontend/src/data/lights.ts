import useSWR from 'swr';
import { Light } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useLights() {
  const { data, error, isLoading, mutate } = useSWR<Light[], ErrorType>(
    '/api/lights',
    fetcher,
  );

  return {
    lights: data,
    error,
    isLoading,
    mutate,
  };
}

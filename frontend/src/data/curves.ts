import useSWR from 'swr';
import { Curve, curvekind } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useCurves(kind: curvekind) {
  const { data, error, isLoading, mutate } = useSWR<Curve[], ErrorType>(
    `/api/curves/${kind === 'bri' ? 'brightness' : 'colorTemperature'}`,
    fetcher,
  );

  return {
    curves: data,
    error,
    isLoading,
    mutate,
  };
}

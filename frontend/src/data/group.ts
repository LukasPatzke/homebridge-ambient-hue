import useSWR from 'swr';
import { Group } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useGroup(id?: number | string) {
  const { data, error, isLoading, mutate } = useSWR<Group, ErrorType>(
    `/api/groups/${id}`,
    fetcher,
  );

  return {
    group: data,
    error,
    isLoading,
    mutate,
  };
}

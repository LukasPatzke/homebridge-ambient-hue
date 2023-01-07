import useSWR from 'swr';
import { Group } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useGroups() {
  const { data, error, isLoading, mutate } = useSWR<Group[], ErrorType>('/api/groups', fetcher);

  return {
    groups: data,
    error,
    isLoading,
    mutate,
  };
}
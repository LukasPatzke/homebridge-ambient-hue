import useSWR, { mutate } from 'swr';
import { Light } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useLight(id?: number | string) {
  const { data, error, isLoading, mutate } = useSWR<Light, ErrorType>(`/api/lights/${id}`, fetcher);

  return {
    light: data,
    error,
    isLoading,
    mutate,
  };
}


export const reset = async (light: Light) => {
  const updatedLight = await fetcher(`/api/${light.resource}/reset`, {
    method: 'POST',
  }) as Light;

  mutate(`/api/${light.resource}`, updatedLight, { revalidate: false });

  return updatedLight;
};
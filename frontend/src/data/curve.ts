import { useNavigate } from 'react-router-dom';
import useSWR, { mutate as mutateGlobal, SWRConfiguration } from 'swr';
import { Curve, curvekind } from '../api.types';
import { ErrorType, fetcher } from './fetcher';

export function useCurve(
  kind: curvekind,
  id?: number | string,
  options?: SWRConfiguration,
) {
  const key = `/api/curves/${
    kind === 'bri' ? 'brightness' : 'colorTemperature'
  }/${id}`;
  const { data, error, isLoading, mutate } = useSWR<Curve, ErrorType>(
    id ? key : null,
    fetcher,
    options,
  );
  const navigate = useNavigate();

  const deleteCurve = async () => {
    if (data === undefined) {
      return;
    }
    const res = await fetch(`/api/${data.resource}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw res;
    }
    mutateGlobal(
      `/api/curves/${kind === 'bri' ? 'brightness' : 'colorTemperature'}`,
    );
    navigate(`/curves/${kind === 'bri' ? 'brightness' : 'colorTemperature'}/0`);
  };

  const updateName = async (name: string) => {
    if (data === undefined) {
      return;
    }
    if (name === data.name) {
      return;
    }
    const res = await fetch(`/api/${data.resource}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name }),
    });

    if (!res.ok) {
      throw res;
    }
    mutate(await res.json(), { revalidate: false });
    mutateGlobal(
      `/api/curves/${kind === 'bri' ? 'brightness' : 'colorTemperature'}`,
    );

    return;
  };

  const insertPoint = async (position: 'before' | 'after', index: number) => {
    if (data === undefined) {
      return;
    }
    const res = await fetch(`/api/${data.resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ index, position }),
    });

    if (!res.ok) {
      throw res;
    }
    const newCurve = (await res.json()) as Curve;

    mutate(newCurve, { revalidate: false });
    return newCurve;
  };

  return {
    curve: data,
    error,
    isLoading,
    mutate,
    deleteCurve,
    updateName,
    insertPoint,
  };
}

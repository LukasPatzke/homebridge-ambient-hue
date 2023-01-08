class FetchError extends Error {
  public status: number;
  public description: string | undefined;

  constructor(message: string, status: number, description?: string) {
    super(message);
    this.status = status;
    this.description = description;
  }
}

export type ErrorType = {
  status: number;
  message: string;
  description?: string;
};

export const fetcher = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) => {
  const res = await fetch(input, init);

  if (!res.ok) {
    const error = new FetchError(res.statusText, res.status);
    const info = await res.json();

    if (info.message) {
      error.description = info.message;
    }
    throw error;
  }

  return res.json();
};

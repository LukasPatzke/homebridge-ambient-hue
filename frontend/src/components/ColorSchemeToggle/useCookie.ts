
import { useState } from 'react';


export type Options = {
  // The number of days the cookie is stored (defaults to 7)
  days?: number;
  // The path of the cookie (defaults to '/')
  path?: string;
  // Browser defaults unless set
  domain?: string;
  SameSite?: 'None' | 'Lax' | 'Strict';
  Secure?: boolean;
  HttpOnly?: boolean;
};

export function stringifyOptions(options: Record<string, any>) {
  return Object.keys(options).reduce((acc, key) => {
    if (key === 'days') {
      return acc;
    } else {
      if (options[key] === false) {
        return acc;
      } else if (options[key] === true) {
        return `${acc}; ${key}`;
      } else {
        return `${acc}; ${key}=${options[key]}`;
      }
    }
  }, '');
}

export const setCookie = (name: string, value: string, options: Options) => {
  const optionsWithDefaults = {
    days: 7,
    path: '/',
    ...options,
  };

  const expires = new Date(
    Date.now() + optionsWithDefaults.days * 864e5,
  ).toUTCString();

  document.cookie =
    name +
    '=' +
    encodeURIComponent(value) +
    '; expires=' +
    expires +
    stringifyOptions(optionsWithDefaults);
};

export function getCookie<T extends string = string>(name: string, initialValue: T) {
  return (
    document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '') as T ||
    initialValue
  );
}

export default function <T extends string = string>(key: string, initialValue: T) {
  const [item, setItem] = useState<T>(() => {
    return getCookie(key, initialValue);
  });

  const updateItem = (value: T, options: Options) => {
    setItem(value);
    setCookie(key, value, options);
  };

  return [item, updateItem] as const;
}
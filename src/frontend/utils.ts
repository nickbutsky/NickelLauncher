import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

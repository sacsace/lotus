import type { ko } from "./ko";

type DeepStringRecord<T> = T extends readonly (infer U)[]
  ? readonly DeepStringRecord<U>[]
  : T extends object
    ? { [K in keyof T]: DeepStringRecord<T[K]> }
    : string;

export type Dictionary = DeepStringRecord<typeof ko>;

import { BindingKey } from "../../di/binding";

const FETCH_TOKEN = Symbol("FETCH");
export const fetchBinding = new BindingKey<typeof fetch>(
  FETCH_TOKEN,
  fetch
);

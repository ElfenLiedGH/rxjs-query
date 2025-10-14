import {BindingKey} from "../../../di/binding";

const authStore = 'authToken';

const GET_AUTH_VALUE_TOKEN = Symbol('GET_AUTH_VALUE');
export const getAuthValueBinding = new BindingKey<() => string | null>(GET_AUTH_VALUE_TOKEN, () => localStorage.getItem(authStore));

const SET_AUTH_VALUE_TOKEN = Symbol('SET_AUTH_VALUE');
export const setAuthValueBinding = new BindingKey<(v: string) => void>(SET_AUTH_VALUE_TOKEN,
    (v: string) => localStorage.setItem(authStore, v)
);

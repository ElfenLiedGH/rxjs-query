import {BindingKey} from "../../../di/binding";
import {ApiRequest} from "./apiRequest";

const API_REQUEST_TOKEN = Symbol('API_REQUEST');
export const apiRequestBinding = new BindingKey<ApiRequest>(API_REQUEST_TOKEN, ApiRequest);

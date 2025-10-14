import {useEffect, useState} from "react";
import type {ApiRequestOptions, RequestState} from "../../request/types.ts";
import {container} from "../../../di";
import {rxJsRequestBinding} from "../../request";

export function useApiRequest(requestOptions?: ApiRequestOptions) {


    const [data, setData] = useState<RequestState<{ user: string }>>()
    useEffect(() => {

        const sub = container.resolve(rxJsRequestBinding)
            .createApiRequest<{ user: string }>('users', requestOptions)
            .subject
            .subscribe(data => {
                console.log('!!!!', data)
                setData(data)
            })

        return () => {
            console.log('back')
            sub.unsubscribe()
        }

    }, [])
    return data
}
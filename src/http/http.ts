import axios, { AxiosResponse } from 'axios'
import { suggestionList } from '../utils/mockHttp'

export function getSuggestion():Promise<AxiosResponse<Array<string>>> {
    if (import.meta.env.VITE_APP_PROFILE==='DEV') {
        return Promise.resolve(suggestionList)
    }
    return axios.get<Array<string>>('/api/v1/suggestions')
}
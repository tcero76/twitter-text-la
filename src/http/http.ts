import axios, { AxiosResponse } from 'axios'

export function getSuggestion():Promise<AxiosResponse<Array<string>>> {
    return axios.get<Array<string>>('/api/v1/suggestions')
}
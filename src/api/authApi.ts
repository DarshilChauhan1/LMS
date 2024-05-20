import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {baseURL} from '../config/config'
import { login } from '../store/authSlice'

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${baseURL}/auth`
    }),
    endpoints : (builder)=>({
        login : builder.mutation({
            query : (data) => ({
                url: '/auth/login',
                method: 'POST',
                body : data
            }),
        })
    })
})


export const {useLoginMutation} = authApi
import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    isAuthenticated: false,
    userData: null
}
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login : (state, action) => {
            state.isAuthenticated = true
            state.userData = action.payload
        },
        logout : (state) => {
            state.isAuthenticated = false
            state.userData = null
        }
    }
})

export default authSlice.reducer
export const {login, logout} = authSlice.actions
"use client";
import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name:'user',
    initialState:{ uid: '', email: '', flashcards: []},
    reducers: {
        setUser: (user, action) => {
            // console.log('setUser', action.payload)
            user = action.payload
        }
    }
})

export const {setUser} = userSlice.actions
export const selectUser = state => state?.user

export default userSlice.reducer

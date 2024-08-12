"use client";
import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
    name:'user',
    initialState:{
        currentUser: null,
    },
    reducers: {
        setUser: (user, action) => {
            // console.log('setUser', action.payload)
            user.currentUser = action.payload
        }
    }
})

export const {setUser} = usersSlice.actions
export const selectUser = state => state?.user

export default usersSlice.reducer

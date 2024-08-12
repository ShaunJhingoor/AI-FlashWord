// src/store/store.js
"use client";
import userReducer from "./userSlice";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        user: userReducer
    }
});

export default store;

import { store } from "@/redux/store";

export type RootReducer = ReturnType<typeof store.getState>;

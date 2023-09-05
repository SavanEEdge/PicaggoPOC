import { useEffect } from "react";
import { AppState } from "react-native";

export function useAppState(callback) {
    useEffect(() => {
        const subscription = AppState.addEventListener('change', callback);

        return () => {
            subscription.remove();
        };
    }, []);
}
import { RawData } from "ws";

export const parseWebSocketMessage = (data: RawData): { action: string; id: string } | null => {
    try {
        const messageStr = data.toString().trim();
        const dataParse = JSON.parse(messageStr);
        if (typeof dataParse === "string") {
            return JSON.parse(dataParse);
        }
        return dataParse;
    } catch (error) {
        console.error("❌ Erreur de parsing WebSocket:", error);
        return null;
    }
};

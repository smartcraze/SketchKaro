import { HTTP_BACKEND } from "@/Config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    try {
        const res = await axios.get(`${HTTP_BACKEND}/room/${roomId}`);

        const messages = Array.isArray(res.data) ? res.data : [];

        const shapes = messages.map((x: { message: string }) => {
            try {
                const messageData = JSON.parse(x.message);
                return messageData.shape;
            } catch (err) {
                console.error("Invalid JSON in message:", x.message);
                return null;
            }
        }).filter(Boolean); 

        return shapes;
    } catch (error) {
        console.error("Error fetching shapes:", error);
        return [];
    }
}

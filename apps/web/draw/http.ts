import { HTTP_BACKEND } from "@/Config";
import axios from "axios";

/**
 * Fetch existing shapes for a room from the backend
 * Demo rooms (starting with 'demo-') return an empty array since they don't persist to database
 * 
 * @param roomId - The room ID to fetch shapes for
 * @returns Array of shapes or empty array if none found
 */
export async function getExistingShapes(roomId: string) {
    try {
        
        if (roomId.startsWith('demo-')) {
            console.log('📝 Demo room detected - starting with empty canvas');
            return [];
        }

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

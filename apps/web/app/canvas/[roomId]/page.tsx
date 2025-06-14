import { RoomCanvas } from "@/components/RoomCanvas";

interface PageProps {
    params: Promise<{
        roomId: string
    }>
}

export default async function CanvasPage({ params }: PageProps) {
    const { roomId } = await params;  

    return <RoomCanvas roomId={roomId} />
   
}
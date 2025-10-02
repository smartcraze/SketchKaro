interface CursorOverlayProps {
  userCursors: Map<
    string,
    { x: number; y: number; color: string; name: string }
  >;
  currentUserId: string | null;
}

export function CursorOverlay({
  userCursors,
  currentUserId,
}: CursorOverlayProps) {
  return (
    <>
      {Array.from(userCursors.entries()).map(([userId, cursor]) => {
        if (userId === currentUserId) return null; // Don't show own cursor
        return (
          <div
            key={userId}
            className="absolute pointer-events-none z-10"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            />
            <div
              className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </div>
          </div>
        );
      })}
    </>
  );
}

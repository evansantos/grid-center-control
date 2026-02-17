/* ── Desk (SVG-style but in divs) ── */
export function DeskUnit({
  x, y, monitors, active, nameplate, teacup, energyDrink, stickyNotes, paintSplats, bookStacks,
}: {
  x: number; y: number; monitors: number; active: boolean;
  nameplate?: string; teacup?: boolean; energyDrink?: boolean;
  stickyNotes?: boolean; paintSplats?: boolean; bookStacks?: boolean;
}) {
  return (
    <div style={{ position: 'absolute', left: x - 15, top: y + 34, pointerEvents: 'none' }}>
      {/* Monitors */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 2, justifyContent: 'center' }}>
        {Array.from({ length: monitors }).map((_, i) => (
          <div key={i} style={{
            width: monitors > 2 ? 11 : 14,
            height: 10,
            borderRadius: 2,
            backgroundColor: active ? '#0a1f0a' : '#1a1a2e',
            border: `1px solid ${active ? '#22c55e40' : '#27272a'}`,
            boxShadow: active ? '0 0 6px #22c55e30' : undefined,
            position: 'relative',
          }}>
            {active && monitors >= 3 && (
              <div style={{ position: 'absolute', bottom: 2, left: 2, display: 'flex', gap: 1 }}>
                {['#22c55e','#3b82f6','#f97316'].slice(0, 2).map((c, j) => (
                  <div key={j} style={{ width: 1, height: 3 + j * 2, backgroundColor: c }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Desk surface */}
      <div style={{
        width: Math.max(monitors * 16, 40),
        height: 8,
        borderRadius: 2,
        backgroundColor: '#8B7355',
        border: '1px solid #5c4d3a',
        position: 'relative',
      }}>
        {active && (
          <div style={{
            position: 'absolute', right: -10, top: -6,
            width: 6, height: 7,
            backgroundColor: '#78350f', borderRadius: '0 0 2px 2px',
            border: '1px solid #92400e',
          }}>
            <div style={{
              position: 'absolute', top: -5, left: 1,
              fontSize: 6, color: '#a8a29e',
              animation: 'steamRise 2s ease-in-out infinite',
            }}>~</div>
          </div>
        )}
        {teacup && (
          <div style={{
            position: 'absolute', right: -8, top: -4,
            width: 7, height: 5,
            backgroundColor: '#d4a574', borderRadius: '0 0 3px 3px',
            border: '1px solid #a16207',
          }} />
        )}
        {energyDrink && (
          <div style={{
            position: 'absolute', left: -8, top: -6,
            width: 4, height: 8,
            backgroundColor: '#22d3ee', borderRadius: 1,
            border: '1px solid #06b6d4',
          }} />
        )}
        {stickyNotes && (
          <div style={{ position: 'absolute', right: -14, top: -10, display: 'flex', flexWrap: 'wrap', gap: 1, width: 12 }}>
            {['#fef08a','#fbcfe8','#a5f3fc'].map((c,i) => (
              <div key={i} style={{ width: 5, height: 5, backgroundColor: c, borderRadius: 1 }} />
            ))}
          </div>
        )}
        {paintSplats && (
          <div style={{ position: 'absolute', top: -2, left: 2, display: 'flex', gap: 3 }}>
            {['#dc2626','#3b82f6','#eab308','#22c55e'].map((c,i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: c, opacity: 0.7 }} />
            ))}
          </div>
        )}
        {bookStacks && (
          <>
            <div style={{ position: 'absolute', left: -12, top: -14, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['#dc2626','#3b82f6','#eab308'].map((c,i) => (
                <div key={i} style={{ width: 8, height: 3, backgroundColor: c, borderRadius: 1, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', right: -12, top: -10, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['#8b5cf6','#22c55e'].map((c,i) => (
                <div key={i} style={{ width: 8, height: 3, backgroundColor: c, borderRadius: 1, opacity: 0.8 }} />
              ))}
            </div>
          </>
        )}
      </div>
      {nameplate && (
        <div style={{
          fontSize: 6, fontFamily: 'monospace', color: '#a8a29e',
          textAlign: 'center', marginTop: 1,
        }}>{nameplate}</div>
      )}
    </div>
  );
}

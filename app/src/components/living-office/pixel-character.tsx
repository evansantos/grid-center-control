import type { AgentCfg } from './types';

/* ── Pixel Character (CSS box-shadow, 6×8 grid per PIXEL's spec) ── */
export function PixelCharacter({
  agent,
  status,
  animDelay,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  animDelay: number;
}) {
  const s = 4; // pixel size
  const skin = '#fbbf24';
  const dark = '#334155';
  const c = agent.color;
  const acc = agent.accent;

  // Base template: 6 wide × 8 tall
  const pixels: [number, number, string][] = [
    [2,0,skin],[3,0,skin],
    [2,1,skin],[3,1,skin],
    [1,2,c],[2,2,c],[3,2,c],[4,2,c],
    [1,3,c],[2,3,c],[3,3,c],[4,3,c],
    [2,4,c],[3,4,c],
    [0,2,c],[0,3,skin],
    [5,2,c],[5,3,skin],
    [2,5,dark],[3,5,dark],
    [2,6,dark],[3,6,dark],
  ];

  switch (agent.accessory) {
    case 'tie':
      pixels.push([3,2,acc],[3,3,acc]);
      break;
    case 'hoodie':
      pixels.push([1,0,acc],[2,0,acc],[3,0,acc],[4,0,acc]);
      pixels.push([5,1,acc]);
      break;
    case 'magnifier':
      pixels.push([6,3,'#854d0e'],[6,4,'#854d0e'],[7,3,'#b45309']);
      break;
    case 'epaulettes':
      pixels.push([-1,2,acc],[6,2,acc]);
      break;
    case 'clipboard':
      pixels.push([-1,2,'#9a3412'],[-1,3,'#9a3412'],[-1,4,'#9a3412'],[-1,5,'#b45309']);
      break;
    case 'glasses':
      pixels.push([1,0,'#164e63'],[4,0,'#164e63']);
      break;
    case 'teacup':
      break;
    case 'pen':
      pixels.push([6,3,'#831843'],[6,4,'#831843']);
      break;
    case 'beret':
      pixels.push([1,-1,acc],[2,-1,acc],[3,-1,acc],[4,-1,acc]);
      break;
    case 'guitar':
      pixels.push([6,2,'#78350f'],[6,3,'#78350f'],[6,4,'#b45309'],[7,3,'#b45309']);
      break;
    case 'readglasses':
      pixels.push([1,0,'#1c3d2e'],[4,0,'#1c3d2e']);
      break;
  }

  const minX = Math.min(...pixels.map(p => p[0]));
  const minY = Math.min(...pixels.map(p => p[1]));

  const shadow = pixels
    .map(([x, y, col]) => `${(x - minX) * s}px ${(y - minY) * s}px 0 0 ${col}`)
    .join(', ');

  const totalW = (Math.max(...pixels.map(p => p[0])) - minX + 1) * s;
  const totalH = (Math.max(...pixels.map(p => p[1])) - minY + 1) * s;

  const bounceAnim = status === 'active'
    ? 'pixelBounce 0.6s ease-in-out infinite alternate'
    : status === 'idle'
      ? `breathe 3.5s ease-in-out ${animDelay * 0.7}s infinite`
      : status === 'recent'
        ? `leanBack 4s ease-in-out ${animDelay}s infinite`
        : undefined;

  return (
    <div style={{
      width: s,
      height: s,
      boxShadow: shadow,
      marginRight: totalW - s,
      marginBottom: totalH - s,
      animation: bounceAnim,
    }} />
  );
}

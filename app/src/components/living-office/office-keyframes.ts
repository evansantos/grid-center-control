export const OFFICE_KEYFRAMES = `
  @keyframes pixelBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  @keyframes breathe {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1px); }
  }
  @keyframes leanBack {
    0%, 85%, 100% { transform: translateX(0); }
    90% { transform: translateX(2px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.15); }
  }
  @keyframes typingDot {
    0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
    40% { opacity: 1; transform: translateY(-2px); }
  }
  @keyframes typeLeft {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-2px) rotate(-5deg); }
  }
  @keyframes typeRight {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-2px) rotate(5deg); }
  }
  @keyframes strum {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(8deg); }
    75% { transform: rotate(-8deg); }
  }
  @keyframes steamRise {
    0% { transform: translateY(0); opacity: 0.4; }
    100% { transform: translateY(-8px); opacity: 0; }
  }
  @keyframes bubbleRise {
    0% { transform: translateY(0); opacity: 0.6; }
    100% { transform: translateY(-14px); opacity: 0; }
  }
  @keyframes ledBlink {
    0%, 45%, 55%, 100% { opacity: 1; }
    50% { opacity: 0.15; }
  }
  @keyframes neonFlicker {
    0%, 93%, 95%, 97%, 100% { opacity: 1; }
    94% { opacity: 0.8; }
    96% { opacity: 0.95; }
    98% { opacity: 0.85; }
  }
  @keyframes colonBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.3; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes linePulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

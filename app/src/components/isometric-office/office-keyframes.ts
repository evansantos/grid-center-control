/* ── CSS Keyframes for Isometric Office ── */

export const OFFICE_KEYFRAMES = `
  @keyframes isoCharBounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(-3px); }
  }
  @keyframes isoCharBreathe {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1.5px); }
  }
  @keyframes isoGlowPulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  @keyframes isoTypingDot {
    0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
    40% { opacity: 1; transform: translateY(-3px); }
  }
  @keyframes isoNeonFlicker {
    0%, 93%, 95%, 97%, 100% { opacity: 1; }
    94% { opacity: 0.7; }
    96% { opacity: 0.9; }
  }
  @keyframes isoFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeInMsg {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .agent-msg-scroll::-webkit-scrollbar {
    width: 5px;
  }
  .agent-msg-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .agent-msg-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.25);
    border-radius: 4px;
  }
  .agent-msg-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.4);
  }
`;

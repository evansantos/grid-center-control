/* ── CSS Keyframes for Living Office ── */

export const OFFICE_KEYFRAMES = `
  /* ──── Walking Animations ──── */
  @keyframes avatar-walk {
    0% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-2px);
    }
    50% {
      transform: translateY(0);
    }
    75% {
      transform: translateY(-1px);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes avatar-walk-left-leg {
    0%, 100% {
      transform: translateX(0) rotateZ(0deg);
    }
    50% {
      transform: translateX(-1px) rotateZ(-5deg);
    }
  }

  @keyframes avatar-walk-right-leg {
    0%, 100% {
      transform: translateX(0) rotateZ(0deg);
    }
    50% {
      transform: translateX(1px) rotateZ(5deg);
    }
  }

  @keyframes avatar-walk-shadow {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.9);
    }
  }

  .avatar-walking {
    animation: avatar-walk 0.6s ease-in-out infinite;
    z-index: 10;
  }

  .avatar-walking .avatar-leg-left {
    animation: avatar-walk-left-leg 0.6s ease-in-out infinite;
  }

  .avatar-walking .avatar-leg-right {
    animation: avatar-walk-right-leg 0.6s ease-in-out infinite reverse;
  }

  .avatar-walking .avatar-shadow {
    animation: avatar-walk-shadow 0.6s ease-in-out infinite;
  }

  /* ──── Typing Animations (Active State) ──── */
  @keyframes avatar-typing-arms {
    0%, 100% {
      transform: rotateX(0deg);
    }
    25% {
      transform: rotateX(-10deg);
    }
    75% {
      transform: rotateX(-5deg);
    }
  }

  @keyframes avatar-typing-body-bob {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-1px);
    }
  }

  @keyframes screen-glow-pulse {
    0%, 100% {
      box-shadow: 0 0 8px var(--agent-color-alpha-30, rgba(124, 58, 237, 0.3));
    }
    50% {
      box-shadow: 0 0 16px var(--agent-color-alpha-50, rgba(124, 58, 237, 0.5)), 
                  0 0 24px var(--agent-color-alpha-30, rgba(124, 58, 237, 0.3));
    }
  }

  @keyframes screen-particles {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0.8);
    }
    50% {
      opacity: 1;
      transform: translateY(-8px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-16px) scale(0.6);
    }
  }

  .avatar-typing {
    animation: avatar-typing-body-bob 2s ease-in-out infinite;
  }

  .avatar-typing .avatar-arms {
    animation: avatar-typing-arms 1.5s ease-in-out infinite;
  }

  /* ──── Idle Activities ──── */
  @keyframes avatar-idle-breathe {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-1px) scale(1.01);
    }
  }

  @keyframes avatar-coffee-sip {
    0%, 80%, 100% {
      transform: rotateZ(0deg);
    }
    10%, 70% {
      transform: rotateZ(-15deg);
    }
  }

  @keyframes avatar-stretch {
    0%, 100% {
      transform: rotateZ(0deg) translateY(0);
    }
    50% {
      transform: rotateZ(5deg) translateY(-4px);
    }
  }

  @keyframes avatar-read {
    0%, 100% {
      transform: rotateX(0deg);
    }
    50% {
      transform: rotateX(-10deg);
    }
  }

  @keyframes avatar-phone-check {
    0%, 90%, 100% {
      transform: rotateZ(0deg);
    }
    10%, 80% {
      transform: rotateZ(-20deg) translateY(-2px);
    }
  }

  @keyframes avatar-think-sway {
    0%, 100% {
      transform: rotateZ(0deg);
    }
    50% {
      transform: rotateZ(2deg);
    }
  }

  @keyframes avatar-chat-gesture {
    0%, 100% {
      transform: rotateZ(0deg);
    }
    25% {
      transform: rotateZ(-8deg);
    }
    75% {
      transform: rotateZ(8deg);
    }
  }

  .avatar-idle-breathe {
    animation: avatar-idle-breathe 4s ease-in-out infinite;
  }

  .avatar-idle-coffee .avatar-arm-left {
    animation: avatar-coffee-sip 6s ease-in-out infinite;
  }

  .avatar-idle-stretch {
    animation: avatar-stretch 8s ease-in-out infinite;
  }

  .avatar-idle-read .avatar-head {
    animation: avatar-read 5s ease-in-out infinite;
  }

  .avatar-idle-phone .avatar-arm-right {
    animation: avatar-phone-check 7s ease-in-out infinite;
  }

  .avatar-idle-think {
    animation: avatar-think-sway 6s ease-in-out infinite;
  }

  .avatar-idle-chat .avatar-arm-left {
    animation: avatar-chat-gesture 4s ease-in-out infinite;
  }

  /* ──── Sitting & Standing Transitions ──── */
  @keyframes avatar-sit-down {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(8px);
    }
  }

  @keyframes avatar-stand-up {
    0% {
      transform: translateY(8px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .avatar-sitting-transition-in {
    animation: avatar-sit-down 0.5s ease-out forwards;
  }

  .avatar-standing-transition-in {
    animation: avatar-stand-up 0.5s ease-out forwards;
  }

  .avatar-sitting {
    transform: translateY(8px);
  }

  /* ──── Meeting Room Animations ──── */
  @keyframes speech-bubble-appear {
    0% {
      opacity: 0;
      transform: scale(0.8) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes whiteboard-writing {
    0% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px) translateY(-2px);
    }
    100% {
      transform: translateX(-5px);
    }
  }

  @keyframes presentation-gesture {
    0%, 100% {
      transform: rotateZ(0deg);
    }
    33% {
      transform: rotateZ(-15deg) translateY(-2px);
    }
    66% {
      transform: rotateZ(15deg) translateY(-1px);
    }
  }

  .speech-bubble {
    animation: speech-bubble-appear 0.3s ease-out;
  }

  .avatar-presenting .avatar-arm-left {
    animation: whiteboard-writing 2s ease-in-out infinite;
  }

  .avatar-presenting .avatar-arm-right {
    animation: presentation-gesture 3s ease-in-out infinite;
  }

  /* ──── Ambient Animations ──── */
  @keyframes particle-drift {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    20% {
      opacity: 0.6;
    }
    80% {
      opacity: 0.3;
    }
    100% {
      transform: translateY(-100px) translateX(20px);
      opacity: 0;
    }
  }

  @keyframes dust-particle-float {
    0% {
      transform: translateY(0) translateX(0) rotateZ(0deg);
      opacity: 0.1;
    }
    50% {
      opacity: 0.4;
      transform: translateY(-50px) translateX(10px) rotateZ(180deg);
    }
    100% {
      transform: translateY(-100px) translateX(-5px) rotateZ(360deg);
      opacity: 0;
    }
  }

  @keyframes plant-sway {
    0%, 100% {
      transform: rotateZ(0deg);
    }
    50% {
      transform: rotateZ(2deg);
    }
  }

  @keyframes plant-leaf-flutter {
    0%, 100% {
      transform: rotateZ(0deg) scale(1);
    }
    33% {
      transform: rotateZ(1deg) scale(1.02);
    }
    66% {
      transform: rotateZ(-1deg) scale(0.98);
    }
  }

  @keyframes steam-rise {
    0% {
      opacity: 0.8;
      transform: translateY(0) scale(0.8);
    }
    100% {
      opacity: 0;
      transform: translateY(-20px) scale(1.2);
    }
  }

  @keyframes coffee-bubble {
    0%, 100% {
      transform: scale(0.8);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .ambient-particle {
    animation: particle-drift 15s linear infinite;
  }

  .dust-particle {
    animation: dust-particle-float 20s linear infinite;
  }

  .plant-element {
    animation: plant-sway 6s ease-in-out infinite;
  }

  .plant-leaf {
    animation: plant-leaf-flutter 4s ease-in-out infinite;
  }

  .steam-particle {
    animation: steam-rise 3s ease-out infinite;
  }

  .coffee-bubble {
    animation: coffee-bubble 4s ease-in-out infinite;
  }

  /* ──── Neon & Light Effects ──── */
  @keyframes neon-flicker {
    0%, 93%, 95%, 97%, 100% {
      opacity: 1;
      filter: brightness(1);
    }
    94% {
      opacity: 0.7;
      filter: brightness(0.8);
    }
    96% {
      opacity: 0.9;
      filter: brightness(0.95);
    }
  }

  @keyframes monitor-scan-line {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes desk-lamp-sway {
    0%, 100% {
      transform: rotateZ(0deg);
    }
    50% {
      transform: rotateZ(1deg);
    }
  }

  .neon-element {
    animation: neon-flicker 8s ease-in-out infinite;
  }

  .monitor-active::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    animation: monitor-scan-line 2s linear infinite;
    pointer-events: none;
  }

  .desk-lamp {
    animation: desk-lamp-sway 12s ease-in-out infinite;
  }

  /* ──── Interaction Animations ──── */
  @keyframes button-press {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes hover-bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  @keyframes notification-pop {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    80% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .button-pressed {
    animation: button-press 0.2s ease-out;
  }

  .hover-element:hover {
    animation: hover-bounce 0.6s ease-in-out;
  }

  .notification-new {
    animation: notification-pop 0.4s ease-out;
  }

  .pulse-indicator::after {
    content: '';
    position: absolute;
    inset: -4px;
    border: 2px solid currentColor;
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
    opacity: 0.6;
  }

  /* ──── Zone Atmosphere Effects ──── */
  @keyframes zone-glow-pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  @keyframes data-stream {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes creative-spark {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) rotate(360deg);
      opacity: 0;
    }
  }

  .zone-engineering .zone-glow {
    animation: zone-glow-pulse 4s ease-in-out infinite;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 60%);
  }

  .zone-creative .creative-spark {
    animation: creative-spark 3s ease-in-out infinite;
  }

  .data-stream-element {
    animation: data-stream 6s linear infinite;
  }

  /* ──── Responsive & Accessibility ──── */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (max-width: 768px) {
    .ambient-particle,
    .dust-particle,
    .steam-particle {
      display: none;
    }
    
    .avatar-walking {
      animation-duration: 0.8s;
    }
    
    .avatar-typing {
      animation-duration: 3s;
    }
  }

  /* ──── Legacy Animations (Keep for Compatibility) ──── */
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

  /* ──── Scrollbar Styling ──── */
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
'use client'

import React from 'react'
import type { AgentCfg } from './types'
import { OFFICE_KEYFRAMES } from './office-keyframes'

interface AvatarProps {
  agent: AgentCfg
  status: 'active' | 'recent' | 'idle'
  animation: 'idle' | 'walking' | 'typing' | 'sitting' | 'coffee' | 'reading'
}

export function AgentAvatar({ agent, status, animation }: AvatarProps) {
  const avatarDesign = getAvatarDesign(agent.id)
  const animationClass = getAnimationClass(animation)
  const statusOpacity = status === 'idle' ? 0.75 : 1

  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: '48px',
        height: '64px',
        transformStyle: 'preserve-3d',
        opacity: statusOpacity,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {/* Inject keyframes */}
      <style>{OFFICE_KEYFRAMES}</style>
      <style>{avatarDesign.customKeyframes || ''}</style>
      
      {/* Active agent glow ring */}
      {status === 'active' && (
        <GlowRing agentColor={agent.color} />
      )}
      
      {/* Avatar container with animation */}
      <div 
        className={`avatar-container ${animationClass}`}
        style={{
          position: 'relative',
          width: '48px',
          height: '64px',
          '--agent-color': agent.color,
          '--agent-color-dark': agent.colorDark,
        } as React.CSSProperties}
      >
        {/* Layer 1: Shadow */}
        <AvatarShadow animation={animation} />
        
        {/* Layer 2: Legs */}
        <AvatarLegs animation={animation} avatarDesign={avatarDesign} />
        
        {/* Layer 3: Torso */}
        <AvatarTorso agent={agent} avatarDesign={avatarDesign} />
        
        {/* Layer 4: Arms */}
        <AvatarArms animation={animation} avatarDesign={avatarDesign} />
        
        {/* Layer 5: Head */}
        <AvatarHead avatarDesign={avatarDesign} />
        
        {/* Layer 6: Hair */}
        <AvatarHair agent={agent} avatarDesign={avatarDesign} />
        
        {/* Layer 7: Accessory */}
        <AvatarAccessory agent={agent} avatarDesign={avatarDesign} animation={animation} />
        
        {/* Special Effects */}
        {status === 'active' && animation === 'typing' && (
          <TypingParticles agentColor={agent.color} />
        )}
      </div>
    </div>
  )
}

/* ── Avatar Design System ── */

interface AvatarDesign {
  hairStyle: React.CSSProperties
  hairExtra?: React.CSSProperties[]
  skinTone: string
  outfitDetails?: React.CSSProperties[]
  accessoryStyle: React.CSSProperties
  accessoryContent: string
  customKeyframes?: string
}

function getAvatarDesign(agentId: string): AvatarDesign {
  const designs: Record<string, AvatarDesign> = {
    mcp: {
      // MCP: Spiky flame-like hair, Crown, Royal robe
      hairStyle: {
        position: 'absolute',
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '26px',
        height: '10px',
        background: 'linear-gradient(45deg, #374151, #1f2937)',
        clipPath: 'polygon(0% 100%, 10% 70%, 20% 100%, 30% 60%, 40% 100%, 50% 50%, 60% 100%, 70% 60%, 80% 100%, 90% 70%, 100% 100%)',
      },
      skinTone: '#fcd34d',
      accessoryStyle: {
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '16px',
        animation: 'mcpCrown 4s ease-in-out infinite',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
      },
      accessoryContent: '👑',
      customKeyframes: `
        @keyframes mcpCrown {
          0%, 100% { transform: translateX(-50%) rotateZ(0deg) scale(1); }
          50% { transform: translateX(-50%) rotateZ(2deg) scale(1.05); }
        }
      `,
    },
    
    ceo: {
      // CEO: Slicked back hair, Tie, Business suit
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '22px',
        height: '8px',
        background: 'linear-gradient(90deg, #6b7280, #4b5563)',
        borderRadius: '4px 4px 0 0',
      },
      skinTone: '#fed7aa',
      outfitDetails: [
        // Tie on torso
        {
          position: 'absolute',
          top: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: '18px',
          background: 'linear-gradient(180deg, #1e40af, #1e3a8a)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 15%, 80% 30%, 100% 45%, 80% 60%, 100% 75%, 80% 90%, 100% 100%, 0% 100%, 20% 90%, 0% 75%, 20% 60%, 0% 45%, 20% 30%, 0% 15%)',
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
      },
      accessoryContent: '👔',
    },
    
    grid: {
      // GRID: Messy/short hair, Lightning badge, Hoodie
      hairStyle: {
        position: 'absolute',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '24px',
        height: '9px',
        background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
        clipPath: 'polygon(0% 100%, 15% 60%, 25% 100%, 35% 50%, 45% 100%, 55% 40%, 65% 100%, 75% 70%, 85% 100%, 95% 80%, 100% 100%)',
      },
      skinTone: '#fef3c7',
      outfitDetails: [
        // Hood
        {
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '12px',
          background: 'var(--agent-color)',
          borderRadius: '14px 14px 4px 4px',
          opacity: 0.3,
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '8px',
        animation: 'gridLightning 1s ease-in-out infinite',
      },
      accessoryContent: '⚡',
      customKeyframes: `
        @keyframes gridLightning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `,
    },
    
    sentinel: {
      // SENTINEL: Military buzz cut, Shield badge, Uniform
      hairStyle: {
        position: 'absolute',
        top: '-2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '4px',
        background: 'linear-gradient(90deg, #475569, #334155)',
        borderRadius: '2px',
      },
      skinTone: '#fbbf24',
      outfitDetails: [
        // Military collar
        {
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '26px',
          height: '4px',
          background: '#1e3a8a',
          borderRadius: '2px',
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '6px',
        right: '4px',
        fontSize: '8px',
      },
      accessoryContent: '🛡️',
    },
    
    bug: {
      // BUG: Curly hair, Magnifying glass, Lab coat
      hairStyle: {
        position: 'absolute',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '24px',
        height: '8px',
        background: 'linear-gradient(45deg, #84cc16, #65a30d)',
        borderRadius: '50% 50% 30% 30%',
      },
      hairExtra: [
        // Curly details
        {
          position: 'absolute',
          top: '-3px',
          left: '3px',
          width: '4px',
          height: '4px',
          background: '#84cc16',
          borderRadius: '50%',
        },
        {
          position: 'absolute',
          top: '-4px',
          right: '3px',
          width: '3px',
          height: '3px',
          background: '#84cc16',
          borderRadius: '50%',
        }
      ],
      skinTone: '#fed7aa',
      accessoryStyle: {
        position: 'absolute',
        top: '2px',
        right: '-8px',
        fontSize: '12px',
        animation: 'bugMagnify 3s ease-in-out infinite',
      },
      accessoryContent: '🔍',
      customKeyframes: `
        @keyframes bugMagnify {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `,
    },
    
    arch: {
      // ARCH: Neat side-part, Glasses, Turtleneck
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '22px',
        height: '8px',
        background: 'linear-gradient(90deg, #64748b, #475569)',
        borderRadius: '4px 4px 0 0',
        clipPath: 'polygon(0% 100%, 0% 20%, 45% 20%, 50% 0%, 55% 20%, 100% 20%, 100% 100%)',
      },
      skinTone: '#fde68a',
      outfitDetails: [
        // Turtleneck collar
        {
          position: 'absolute',
          top: '-2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '6px',
          background: 'var(--agent-color-dark)',
          borderRadius: '2px',
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
      },
      accessoryContent: '📐',
    },
    
    dev: {
      // DEV: Beanie hat, Headphones, T-shirt
      hairStyle: {
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '26px',
        height: '12px',
        background: 'linear-gradient(180deg, #374151, #1f2937)',
        borderRadius: '13px 13px 4px 4px',
      },
      skinTone: '#fcd34d',
      accessoryStyle: {
        position: 'absolute',
        top: '2px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        animation: 'riffHeadphones 4s ease-in-out infinite',
      },
      accessoryContent: '🎧',
    },
    
    pixel: {
      // PIXEL: Long hair with beret, Beret + paintbrush, Artsy smock
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '26px',
        height: '14px',
        background: 'linear-gradient(180deg, #ec4899, #db2777)',
        borderRadius: '2px 2px 8px 8px',
      },
      hairExtra: [
        // Beret
        {
          position: 'absolute',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '8px',
          background: '#7c2d12',
          borderRadius: '50%',
        }
      ],
      skinTone: '#fef3c7',
      accessoryStyle: {
        position: 'absolute',
        top: '4px',
        right: '-6px',
        fontSize: '10px',
        animation: 'pixelPaint 5s ease-in-out infinite',
      },
      accessoryContent: '🎨',
      customKeyframes: `
        @keyframes pixelPaint {
          0%, 100% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(-10deg); }
          50% { transform: rotateZ(5deg); }
          75% { transform: rotateZ(-5deg); }
        }
      `,
    },
    
    scribe: {
      // SCRIBE: Ponytail, Pencil behind ear, Cardigan
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '8px',
        background: 'linear-gradient(90deg, #a855f7, #9333ea)',
        borderRadius: '4px 4px 0 0',
      },
      hairExtra: [
        // Ponytail
        {
          position: 'absolute',
          top: '-2px',
          right: '-4px',
          width: '6px',
          height: '12px',
          background: '#a855f7',
          borderRadius: '0 3px 3px 0',
        }
      ],
      skinTone: '#fed7aa',
      accessoryStyle: {
        position: 'absolute',
        top: '2px',
        right: '-6px',
        fontSize: '8px',
      },
      accessoryContent: '✏️',
    },
    
    spec: {
      // SPEC: Undercut, Clipboard, Polo shirt
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '22px',
        height: '8px',
        background: 'linear-gradient(90deg, #92400e, #78350f)',
        clipPath: 'polygon(0% 100%, 0% 60%, 20% 60%, 20% 20%, 80% 20%, 80% 60%, 100% 60%, 100% 100%)',
      },
      skinTone: '#fbbf24',
      outfitDetails: [
        // Polo collar
        {
          position: 'absolute',
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '6px',
          background: 'var(--agent-color)',
          borderRadius: '2px 2px 0 0',
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '4px',
        left: '-8px',
        fontSize: '10px',
      },
      accessoryContent: '📋',
    },
    
    sage: {
      // SAGE: Long beard/wise, Tea cup, Robe/kimono
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '22px',
        height: '8px',
        background: 'linear-gradient(90deg, #a3a3a3, #737373)',
        borderRadius: '4px 4px 0 0',
      },
      hairExtra: [
        // Long beard
        {
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '14px',
          height: '10px',
          background: '#a3a3a3',
          borderRadius: '0 0 7px 7px',
        }
      ],
      skinTone: '#fef3c7',
      accessoryStyle: {
        position: 'absolute',
        top: '4px',
        right: '-8px',
        fontSize: '10px',
        animation: 'sageTea 6s ease-in-out infinite',
      },
      accessoryContent: '🍵',
      customKeyframes: `
        @keyframes sageTea {
          0%, 70%, 100% { transform: rotateZ(0deg); }
          10%, 60% { transform: rotateZ(-15deg) translateY(-2px); }
        }
      `,
    },
    
    atlas: {
      // ATLAS: Explorer hat, Goggles on forehead, Vest + pockets
      hairStyle: {
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '28px',
        height: '12px',
        background: 'linear-gradient(180deg, #92400e, #78350f)',
        borderRadius: '14px 14px 4px 4px',
      },
      hairExtra: [
        // Explorer hat band
        {
          position: 'absolute',
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28px',
          height: '2px',
          background: '#451a03',
        }
      ],
      skinTone: '#fed7aa',
      accessoryStyle: {
        position: 'absolute',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '8px',
      },
      accessoryContent: '🔭',
    },
    
    riff: {
      // RIFF: Emo/long bangs, Headphones, Band tee
      hairStyle: {
        position: 'absolute',
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '26px',
        height: '16px',
        background: 'linear-gradient(180deg, #1f2937, #111827)',
        borderRadius: '2px 2px 8px 8px',
        clipPath: 'polygon(0% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 100%, 0% 100%)',
      },
      skinTone: '#fde68a',
      accessoryStyle: {
        position: 'absolute',
        top: '2px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        animation: 'riffHeadphones 4s ease-in-out infinite',
      },
      accessoryContent: '🎸',
      customKeyframes: `
        @keyframes riffHeadphones {
          0%, 100% { transform: translateX(-50%) rotateZ(0deg); }
          25% { transform: translateX(-50%) rotateZ(-2deg); }
          75% { transform: translateX(-50%) rotateZ(2deg); }
        }
      `,
    },
    
    vault: {
      // VAULT: Short neat, Key necklace, Security jacket
      hairStyle: {
        position: 'absolute',
        top: '-3px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '6px',
        background: 'linear-gradient(90deg, #6b7280, #4b5563)',
        borderRadius: '3px',
      },
      skinTone: '#fcd34d',
      outfitDetails: [
        // Security badge
        {
          position: 'absolute',
          top: '4px',
          left: '4px',
          width: '6px',
          height: '4px',
          background: '#fbbf24',
          borderRadius: '1px',
        }
      ],
      accessoryStyle: {
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '8px',
      },
      accessoryContent: '🔑',
    },
  }
  
  return designs[agentId] || designs.dev // Default to DEV if not found
}

/* ── Avatar Components ── */

function GlowRing({ agentColor }: { agentColor: string }) {
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '-4px',
        left: '50%',
        width: '40px',
        height: '6px',
        background: `radial-gradient(ellipse, ${agentColor}60 0%, transparent 70%)`,
        borderRadius: '50%',
        animation: 'glowPulse 2s ease-in-out infinite',
        transform: 'translateX(-50%)',
      }}
    />
  )
}

function AvatarShadow({ animation }: { animation: string }) {
  const animationClass = animation === 'walking' ? 'avatarWalkShadow 0.6s ease-in-out infinite' : ''
  
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '-2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '32px',
        height: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '50%',
        filter: 'blur(2px)',
        animation: animationClass,
      }}
    />
  )
}

function AvatarLegs({ animation, avatarDesign }: { animation: string, avatarDesign: AvatarDesign }) {
  const walkingAnimation = animation === 'walking'
  
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '22px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {/* Left leg */}
      <div 
        style={{
          width: '8px',
          height: '22px',
          background: 'linear-gradient(180deg, #4a5568 0%, #2d3748 100%)',
          borderRadius: '4px 4px 2px 2px',
          border: '1px solid #1a202c',
          position: 'relative',
          animation: walkingAnimation ? 'avatarWalkLeftLeg 0.6s ease-in-out infinite' : '',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            bottom: '-3px',
            left: '-1px',
            width: '10px',
            height: '6px',
            background: '#2d3748',
            borderRadius: '3px',
            border: '1px solid #1a202c',
          }}
        />
      </div>
      
      {/* Right leg */}
      <div 
        style={{
          width: '8px',
          height: '22px',
          background: 'linear-gradient(180deg, #4a5568 0%, #2d3748 100%)',
          borderRadius: '4px 4px 2px 2px',
          border: '1px solid #1a202c',
          position: 'relative',
          animation: walkingAnimation ? 'avatarWalkRightLeg 0.6s ease-in-out infinite' : '',
        }}
      >
        <div 
          style={{
            position: 'absolute',
            bottom: '-3px',
            left: '-1px',
            width: '10px',
            height: '6px',
            background: '#2d3748',
            borderRadius: '3px',
            border: '1px solid #1a202c',
          }}
        />
      </div>
    </div>
  )
}

function AvatarTorso({ agent, avatarDesign }: { agent: AgentCfg, avatarDesign: AvatarDesign }) {
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '24px',
        height: '26px',
        borderRadius: '6px 6px 2px 2px',
        border: `1px solid ${agent.colorDark}`,
        background: `linear-gradient(180deg, ${agent.color} 0%, ${agent.colorDark} 100%)`,
      }}
    >
      {/* Torso collar/neckline */}
      <div 
        style={{
          position: 'absolute',
          top: '-2px',
          left: '2px',
          width: '20px',
          height: '6px',
          background: agent.color,
          borderRadius: '3px 3px 0 0',
          transform: 'perspective(50px) rotateX(30deg)',
          opacity: 0.8,
        }}
      />
      
      {/* Outfit details */}
      {avatarDesign.outfitDetails?.map((detail, i) => (
        <div key={i} style={detail} />
      ))}
    </div>
  )
}

function AvatarArms({ animation, avatarDesign }: { animation: string, avatarDesign: AvatarDesign }) {
  const typingAnimation = animation === 'typing' ? 'avatarTypingArms 1.5s ease-in-out infinite' : ''
  const walkingAnimation = animation === 'walking' ? 'avatarWalkArms 0.6s ease-in-out infinite' : ''
  const armAnimation = typingAnimation || walkingAnimation
  
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '36px',
        height: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        animation: armAnimation,
      }}
    >
      {/* Left arm */}
      <div 
        style={{
          width: '6px',
          height: '14px',
          background: '#fcd34d',
          borderRadius: '3px',
          border: '1px solid #f59e0b',
          transformOrigin: 'top center',
        }}
      />
      
      {/* Right arm */}
      <div 
        style={{
          width: '6px',
          height: '14px',
          background: '#fcd34d',
          borderRadius: '3px',
          border: '1px solid #f59e0b',
          transformOrigin: 'top center',
        }}
      />
    </div>
  )
}

function AvatarHead({ avatarDesign }: { avatarDesign: AvatarDesign }) {
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '18px',
        background: `linear-gradient(180deg, ${avatarDesign.skinTone} 0%, ${avatarDesign.skinTone}dd 100%)`,
        borderRadius: '6px',
        border: '1px solid #d97706',
      }}
    >
      {/* Eyes */}
      <div 
        style={{
          position: 'absolute',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '4px',
        }}
      >
        <div 
          style={{
            width: '3px',
            height: '3px',
            background: '#1e293b',
            borderRadius: '50%',
            animation: 'eyeBlink 8s ease-in-out infinite',
          }}
        />
        <div 
          style={{
            width: '3px',
            height: '3px',
            background: '#1e293b',
            borderRadius: '50%',
            animation: 'eyeBlink 8s ease-in-out infinite',
            animationDelay: '0.1s',
          }}
        />
      </div>
      
      {/* Mouth */}
      <div 
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '6px',
          height: '1px',
          background: '#7c2d12',
          borderRadius: '1px',
        }}
      />
    </div>
  )
}

function AvatarHair({ agent, avatarDesign }: { agent: AgentCfg, avatarDesign: AvatarDesign }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={avatarDesign.hairStyle} />
      {avatarDesign.hairExtra?.map((hairPart, i) => (
        <div key={i} style={hairPart} />
      ))}
    </div>
  )
}

function AvatarAccessory({ agent, avatarDesign, animation }: { agent: AgentCfg, avatarDesign: AvatarDesign, animation: string }) {
  const bobAnimation = animation === 'idle' ? 'accessoryBob 4s ease-in-out infinite' : ''
  
  return (
    <div 
      style={{
        ...avatarDesign.accessoryStyle,
        animation: `${avatarDesign.accessoryStyle.animation || ''} ${bobAnimation}`.trim(),
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
      }}
    >
      {avatarDesign.accessoryContent}
    </div>
  )
}

function TypingParticles({ agentColor }: { agentColor: string }) {
  const particles = [...Array(4)].map((_, i) => ({
    id: i,
    delay: i * 0.3,
    left: 16 + (i * 4),
  }))

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '48px',
        left: '0',
        width: '48px',
        height: '20px',
        pointerEvents: 'none',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.left}px`,
            bottom: '0',
            width: '2px',
            height: '2px',
            background: `${agentColor}80`,
            borderRadius: '50%',
            animation: 'typingParticle 2s ease-out infinite',
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function getAnimationClass(animation: string): string {
  const animationMap: Record<string, string> = {
    walking: 'avatar-walking',
    typing: 'avatar-typing', 
    sitting: 'avatar-sitting',
    coffee: 'avatar-coffee',
    reading: 'avatar-reading',
    idle: 'avatar-idle-breathe',
  }
  
  return animationMap[animation] || 'avatar-idle-breathe'
}
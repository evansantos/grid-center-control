'use client'

import React from 'react'
import type { AgentCfg } from './types'
import { OFFICE_KEYFRAMES } from './office-keyframes'
import { StatusDot } from '@/components/ui/status-dot'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="absolute pointer-events-none hover:pointer-events-auto"
            style={{
              left: 0,
              top: 0,
              width: '48px',
              height: '64px',
              transformStyle: 'preserve-3d',
              opacity: statusOpacity,
              transition: 'opacity 0.5s ease-in-out',
            }}
            role="img"
            aria-label={`${agent.name} - ${status} - ${animation}`}
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
              
              {/* Status indicator */}
              <div style={{
                position: 'absolute',
                top: -4,
                right: -4,
                zIndex: 10,
              }}>
                <StatusDot 
                  status={status === 'active' ? 'active' : status === 'recent' ? 'busy' : 'idle'} 
                  size="sm"
                  aria-label={`${agent.name} is ${status}`}
                />
              </div>
              
              {/* Special Effects */}
              {status === 'active' && animation === 'typing' && (
                <TypingParticles agentColor={agent.color} />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <div className="text-xs">
            <div className="font-semibold">{agent.emoji} {agent.name}</div>
            <div className="text-grid-text-dim">{agent.zone}</div>
            <div className="text-grid-text-dim">Status: {status}</div>
            <div className="text-grid-text-dim">Activity: {animation}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
        width: '28px',
        height: '16px',
        background: 'linear-gradient(45deg, var(--grid-accent), var(--grid-danger))',
        clipPath: 'polygon(20% 100%, 0% 60%, 15% 40%, 5% 20%, 25% 30%, 45% 0%, 65% 30%, 85% 20%, 75% 40%, 90% 60%, 80% 100%)',
        filter: 'drop-shadow(0 0 4px var(--grid-accent))',
      },
      skinTone: 'var(--grid-text-label)',
      accessoryStyle: {
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '16px',
        filter: 'drop-shadow(0 0 8px var(--grid-warning))',
      },
      accessoryContent: '👑',
      outfitDetails: [
        {
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '20px',
          background: 'linear-gradient(180deg, var(--grid-purple), var(--grid-accent))',
          borderRadius: '12px 12px 4px 4px',
          border: '2px solid var(--grid-warning)',
        }
      ],
      customKeyframes: `
        @keyframes mcp-crown-glow {
          0%, 100% { filter: drop-shadow(0 0 8px var(--grid-warning)); }
          50% { filter: drop-shadow(0 0 16px var(--grid-warning)) drop-shadow(0 0 24px var(--grid-accent)); }
        }
        .avatar-container .mcp-crown {
          animation: mcp-crown-glow 3s ease-in-out infinite;
        }
      `,
    },
    claude: {
      // Claude: Neat professional hair, Glasses, Business outfit
      hairStyle: {
        position: 'absolute',
        top: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '22px',
        height: '12px',
        background: 'linear-gradient(180deg, var(--grid-text), var(--grid-text-dim))',
        borderRadius: '50% 50% 0 0',
      },
      skinTone: 'var(--grid-text-faint)',
      accessoryStyle: {
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '6px',
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: '10px',
      },
      accessoryContent: '',
      outfitDetails: [
        {
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '20px',
          background: 'linear-gradient(180deg, var(--grid-info), var(--grid-surface))',
          borderRadius: '2px',
        }
      ],
    },
    pixel: {
      // Pixel: Colorful spiky hair, Headphones, Casual tech outfit
      hairStyle: {
        position: 'absolute',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '26px',
        height: '14px',
        background: 'linear-gradient(45deg, var(--grid-cyan), var(--grid-purple), var(--grid-accent))',
        clipPath: 'polygon(0% 100%, 10% 70%, 20% 100%, 30% 60%, 40% 100%, 50% 50%, 60% 100%, 70% 60%, 80% 100%, 90% 70%, 100% 100%)',
      },
      skinTone: 'var(--grid-text-secondary)',
      accessoryStyle: {
        position: 'absolute',
        top: '2px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '18px',
      },
      accessoryContent: '🎧',
      outfitDetails: [
        {
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '24px',
          height: '20px',
          background: 'linear-gradient(180deg, var(--grid-surface), var(--grid-surface-hover))',
          borderRadius: '4px',
          border: '1px solid var(--grid-cyan)',
        }
      ],
    },
    // Default design for other agents
    default: {
      hairStyle: {
        position: 'absolute',
        top: '-3px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '10px',
        background: 'var(--grid-text)',
        borderRadius: '50% 50% 0 0',
      },
      skinTone: 'var(--grid-text-label)',
      accessoryStyle: {
        position: 'absolute',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '14px',
      },
      accessoryContent: '👤',
      outfitDetails: [
        {
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '22px',
          height: '18px',
          background: 'var(--grid-surface-hover)',
          borderRadius: '3px',
          border: '1px solid var(--grid-border)',
        }
      ],
    },
  }

  return designs[agentId] || designs.default
}

function getAnimationClass(animation: AvatarProps['animation']): string {
  const animations = {
    walking: 'avatar-walking',
    typing: 'avatar-typing',
    sitting: 'avatar-sitting',
    coffee: 'avatar-idle-coffee',
    reading: 'avatar-idle-read',
    idle: 'avatar-idle-breathe',
  }
  return animations[animation] || animations.idle
}

/* ── Avatar Components ── */

function GlowRing({ agentColor }: { agentColor: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-8px',
        left: '-8px',
        width: '64px',
        height: '80px',
        border: `2px solid ${agentColor}`,
        borderRadius: '50%',
        boxShadow: `0 0 16px ${agentColor}40, inset 0 0 16px ${agentColor}20`,
        animation: 'isoGlowPulse 2s ease-in-out infinite',
        pointerEvents: 'none',
      }}
    />
  )
}

function AvatarShadow({ animation }: { animation: AvatarProps['animation'] }) {
  return (
    <div
      className="avatar-shadow"
      style={{
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: animation === 'walking' ? '32px' : '28px',
        height: '8px',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)',
        borderRadius: '50%',
        transition: 'width 0.3s ease',
      }}
    />
  )
}

function AvatarLegs({ animation, avatarDesign }: { 
  animation: AvatarProps['animation']
  avatarDesign: AvatarDesign 
}) {
  const legColor = avatarDesign.outfitDetails?.[0]?.background || 'var(--grid-surface-hover)'
  
  return (
    <div style={{ position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)' }}>
      {/* Left leg */}
      <div
        className="avatar-leg-left"
        style={{
          position: 'absolute',
          left: '-6px',
          top: '0px',
          width: '6px',
          height: '16px',
          background: legColor,
          borderRadius: '3px 3px 1px 1px',
        }}
      />
      {/* Right leg */}
      <div
        className="avatar-leg-right"
        style={{
          position: 'absolute',
          right: '-6px',
          top: '0px',
          width: '6px',
          height: '16px',
          background: legColor,
          borderRadius: '3px 3px 1px 1px',
        }}
      />
    </div>
  )
}

function AvatarTorso({ agent, avatarDesign }: { 
  agent: AgentCfg
  avatarDesign: AvatarDesign 
}) {
  const outfitStyle = avatarDesign.outfitDetails?.[0] || {
    background: 'var(--grid-surface-hover)',
    borderRadius: '4px',
  }

  return (
    <div
      className="avatar-torso"
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '24px',
        height: '20px',
        ...outfitStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
      }}
    >
      {agent.emoji}
    </div>
  )
}

function AvatarArms({ animation, avatarDesign }: { 
  animation: AvatarProps['animation']
  avatarDesign: AvatarDesign 
}) {
  const armColor = avatarDesign.skinTone

  return (
    <div className="avatar-arms">
      {/* Left arm */}
      <div
        className="avatar-arm-left"
        style={{
          position: 'absolute',
          top: '22px',
          left: '6px',
          width: '8px',
          height: '16px',
          background: armColor,
          borderRadius: '4px',
          transformOrigin: 'top center',
        }}
      />
      {/* Right arm */}
      <div
        className="avatar-arm-right"
        style={{
          position: 'absolute',
          top: '22px',
          right: '6px',
          width: '8px',
          height: '16px',
          background: armColor,
          borderRadius: '4px',
          transformOrigin: 'top center',
        }}
      />
    </div>
  )
}

function AvatarHead({ avatarDesign }: { avatarDesign: AvatarDesign }) {
  return (
    <div
      className="avatar-head"
      style={{
        position: 'absolute',
        top: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '20px',
        background: `radial-gradient(circle at 30% 30%, ${avatarDesign.skinTone}, var(--grid-text-secondary))`,
        borderRadius: '50%',
        border: '1px solid var(--grid-border-subtle)',
      }}
    />
  )
}

function AvatarHair({ agent, avatarDesign }: { 
  agent: AgentCfg
  avatarDesign: AvatarDesign 
}) {
  return (
    <div
      className="avatar-hair"
      style={avatarDesign.hairStyle}
    />
  )
}

function AvatarAccessory({ agent, avatarDesign, animation }: { 
  agent: AgentCfg
  avatarDesign: AvatarDesign
  animation: AvatarProps['animation']
}) {
  if (!avatarDesign.accessoryContent && !agent.accessory) return null

  return (
    <div
      className={`avatar-accessory ${agent.id === 'mcp' ? 'mcp-crown' : ''}`}
      style={avatarDesign.accessoryStyle}
    >
      {avatarDesign.accessoryContent || agent.accessory}
    </div>
  )
}

function TypingParticles({ agentColor }: { agentColor: string }) {
  return (
    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${i * 4 - 4}px`,
            top: '0px',
            width: '2px',
            height: '2px',
            background: agentColor,
            borderRadius: '50%',
            animation: `isoTypingDot 1.5s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
'use client';

import { useState } from 'react';

interface HelpTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  icon?: string;
}

export function HelpTooltip({ text, position = 'top', children, icon = 'ℹ️' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipStyles: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'var(--grid-bg)',
    border: '1px solid var(--grid-border)',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 11,
    color: 'var(--grid-text)',
    lineHeight: 1.4,
    maxWidth: 250,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    ...(position === 'top' && {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
    }),
    ...(position === 'bottom' && {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 8,
    }),
    ...(position === 'left' && {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 8,
    }),
    ...(position === 'right' && {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 8,
    }),
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (
        <span
          style={{
            fontSize: 10,
            color: 'var(--grid-text-secondary)',
            cursor: 'help',
            opacity: 0.7,
            transition: 'opacity 0.2s',
          }}
        >
          {icon}
        </span>
      )}
      {isVisible && (
        <div style={tooltipStyles}>
          {text}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(position === 'top' && {
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '6px 6px 0 6px',
                borderColor: 'var(--grid-border) transparent transparent transparent',
              }),
              ...(position === 'bottom' && {
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 6px 6px 6px',
                borderColor: 'transparent transparent var(--grid-border) transparent',
              }),
              ...(position === 'left' && {
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 0 6px 6px',
                borderColor: 'transparent transparent transparent var(--grid-border)',
              }),
              ...(position === 'right' && {
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 6px 6px 0',
                borderColor: 'transparent var(--grid-border) transparent transparent',
              }),
            }}
          />
        </div>
      )}
    </div>
  );
}

export function InfoBox({ 
  title, 
  children, 
  icon = 'ℹ️', 
  variant = 'info' 
}: {
  title: string;
  children: React.ReactNode;
  icon?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
}) {
  const colors = {
    info: { bg: 'var(--grid-blue-950)', border: 'var(--grid-blue-800)', text: 'var(--grid-blue-200)' },
    warning: { bg: 'var(--grid-yellow-950)', border: 'var(--grid-yellow-800)', text: 'var(--grid-yellow-200)' },
    success: { bg: 'var(--grid-green-950)', border: 'var(--grid-green-800)', text: 'var(--grid-green-200)' },
    error: { bg: 'var(--grid-red-950)', border: 'var(--grid-red-800)', text: 'var(--grid-red-200)' },
  };

  const style = colors[variant];

  return (
    <div style={{
      backgroundColor: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: style.text.replace('200)', '400)'),
      }}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={{ 
        fontSize: 11, 
        color: style.text, 
        lineHeight: 1.4 
      }}>
        {children}
      </div>
    </div>
  );
}
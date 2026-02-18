'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Loading, Spinner, Dots, Pulse } from '@/components/ui/loading';
import { useAnimationPreference } from '@/lib/animations';

export default function AnimationDemoPage() {
  const { reducedMotion } = useAnimationPreference();
  const [showLoadingOverlay, setShowLoadingOverlay] = React.useState(false);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-grid-text mb-4">
          Animation System Demo
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-grid-border bg-grid-surface">
          <span className="text-sm text-grid-text-muted">Reduced Motion:</span>
          <span className={`text-sm font-medium ${reducedMotion ? 'text-grid-warning' : 'text-grid-success'}`}>
            {reducedMotion ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {reducedMotion && (
          <p className="text-sm text-grid-text-muted mt-2">
            Animations are disabled or simplified per your preference
          </p>
        )}
      </div>

      {/* Button Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Button Interactions</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">
            Primary Button
          </Button>
          <Button variant="secondary" animation="subtle">
            Secondary with Subtle
          </Button>
          <Button variant="ghost" animation="bounce">
            Ghost with Bounce
          </Button>
          <Button variant="primary" ripple>
            Ripple Effect
          </Button>
          <Button variant="danger">
            Danger Button
          </Button>
        </div>
        <p className="text-sm text-grid-text-muted">
          Try hovering, focusing (Tab), and clicking these buttons to see the micro-interactions.
        </p>
      </section>

      {/* Card Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Card Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card animation="subtle">
            <CardHeader>
              <CardTitle>Subtle Animation</CardTitle>
              <CardDescription>Default hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-grid-text-muted">
                Gentle border highlight on hover
              </p>
            </CardContent>
          </Card>
          
          <Card animation="lift" interactive>
            <CardHeader>
              <CardTitle>Lift Animation</CardTitle>
              <CardDescription>Interactive card with lift effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-grid-text-muted">
                Scales up and translates on hover
              </p>
            </CardContent>
          </Card>
          
          <Card animation="glow" variant="accent">
            <CardHeader>
              <CardTitle>Glow Animation</CardTitle>
              <CardDescription>Accent variant with glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-grid-text-muted">
                Enhanced glow effect on hover
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Modal Transitions</h2>
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Animation Demo Dialog</DialogTitle>
                <DialogDescription>
                  This dialog demonstrates the enter/exit animations with backdrop blur
                  and spring-like content animation.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-grid-text-muted">
                  Notice the overlay fade-in and content zoom + slide animation.
                  The dialog respects reduced motion preferences.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Dropdown Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Dropdown Transitions</h2>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-grid-text-muted">
          Menu items have subtle slide animations and the menu itself has zoom + slide entrance.
        </p>
      </section>

      {/* Loading Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Spinner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Spinner size="lg" variant="accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Dots size="lg" variant="accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Pulse variant="circle" size="lg" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Combined</CardTitle>
            </CardHeader>
            <CardContent>
              <Loading type="spinner" text="Loading..." />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skeleton Animations */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Skeleton Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Shimmer Effect</CardTitle>
              <CardDescription>Default shimmer animation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="avatar" />
              <Skeleton variant="button" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pulse Effect</CardTitle>
              <CardDescription>Alternative pulse animation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton variant="text" animation="pulse" />
              <Skeleton variant="text" animation="pulse" width="80%" />
              <Skeleton variant="text" animation="pulse" width="60%" />
              <Skeleton variant="avatar" animation="pulse" />
              <Skeleton variant="button" animation="pulse" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Micro-interactions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Micro-interactions</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-grid-surface border border-grid-border rounded text-sm hover:border-grid-border-bright transition-colors duration-fast">
              Subtle hover
            </span>
            <span className="px-2 py-1 bg-grid-surface border border-grid-border rounded text-sm hover:scale-105 hover:-translate-y-0.5 transition-all duration-normal cursor-pointer">
              Gentle lift
            </span>
            <span className="px-2 py-1 bg-grid-accent text-white rounded text-sm active:scale-95 transition-all duration-75 cursor-pointer">
              Press feedback
            </span>
          </div>
          <p className="text-sm text-grid-text-muted">
            These demonstrate subtle micro-interactions that provide instant feedback.
          </p>
        </div>
      </section>

      {/* Accessibility Testing */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">Accessibility Testing</h2>
        <div className="space-y-4">
          <p className="text-sm text-grid-text-muted">
            To test reduced motion compliance:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-grid-text-muted">
            <li>Open your system preferences</li>
            <li>Navigate to Accessibility → Motion</li>
            <li>Enable "Reduce motion" (macOS) or similar setting</li>
            <li>Refresh this page and observe the animation changes</li>
          </ol>
          <div className="mt-4 p-4 border border-grid-border rounded bg-grid-surface">
            <p className="text-sm font-medium text-grid-text mb-2">
              Current Status:
            </p>
            <p className="text-sm text-grid-text-muted">
              {reducedMotion 
                ? "✅ Reduced motion detected - animations are disabled or simplified" 
                : "🎭 Normal motion - all animations are active"
              }
            </p>
          </div>
        </div>
      </section>
      
      {/* Test reduced motion CSS */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-grid-text">CSS Animation Test</h2>
        <div className="space-y-4">
          <div className="animate-bounce-subtle p-4 bg-grid-surface border border-grid-border rounded text-center">
            <p className="text-sm text-grid-text">This has a CSS bounce animation</p>
            <p className="text-xs text-grid-text-muted">Should not animate with reduced motion</p>
          </div>
          <div className="animate-glow-pulse p-4 bg-grid-surface border border-grid-border rounded text-center">
            <p className="text-sm text-grid-text">This has a CSS glow pulse animation</p>
            <p className="text-xs text-grid-text-muted">Should not animate with reduced motion</p>
          </div>
        </div>
      </section>
    </div>
  );
}
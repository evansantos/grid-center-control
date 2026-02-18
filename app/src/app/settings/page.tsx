'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-grid-text">Settings</h1>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-grid-text-dim">
            Settings page — more options coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

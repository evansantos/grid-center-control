import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const NOTIFY_DIR = join(process.cwd(), '..', '.notifications');

export interface Notification {
  timestamp: string;
  type: 'artifact_approved' | 'artifact_rejected' | 'task_action';
  projectId: string;
  details: Record<string, any>;
}

export function sendNotification(notification: Notification): void {
  try {
    if (!existsSync(NOTIFY_DIR)) {
      mkdirSync(NOTIFY_DIR, { recursive: true });
    }
    const filename = `${Date.now()}-${notification.type}.json`;
    writeFileSync(
      join(NOTIFY_DIR, filename),
      JSON.stringify(notification, null, 2)
    );
  } catch (err) {
    console.error('Failed to write notification:', err);
  }
}

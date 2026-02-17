import { NextRequest, NextResponse } from 'next/server';
import { ModelUpdateSchema, validateBody } from '@/lib/validators';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'openclaw.json');

const ALLOWED_MODELS = [
  'claude-sonnet-4-20250514',
  'claude-opus-4-6',
  'gpt-4o',
  'gpt-4.1',
  'o3',
  'gemini-2.5-pro',
];

export async function GET() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(raw);
    return NextResponse.json({ 
      model: config.defaultModel || 'unknown',
      allowed: ALLOWED_MODELS 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = validateBody(ModelUpdateSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { model } = validated.data;
    
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const config = JSON.parse(raw);
    config.defaultModel = model;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, model });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update model' }, { status: 500 });
  }
}

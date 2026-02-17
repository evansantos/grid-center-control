import { NextRequest, NextResponse } from 'next/server';
import { CronJobCreateSchema, CronJobUpdateSchema, CronJobDeleteSchema, validateBody } from '@/lib/validators';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CronJob } from '@/lib/cron-utils';
import os from 'os';

const CRON_FILE = path.join(os.homedir(), '.openclaw', 'cron-jobs.json');

async function ensureCronFile(): Promise<CronJob[]> {
  try {
    const data = await fs.readFile(CRON_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, create it with empty array
    const dir = path.dirname(CRON_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(CRON_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function saveCronJobs(jobs: CronJob[]): Promise<void> {
  await fs.writeFile(CRON_FILE, JSON.stringify(jobs, null, 2));
}

export async function GET() {
  try {
    const jobs = await ensureCronFile();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error reading cron jobs:', error);
    return NextResponse.json({ error: 'Failed to read cron jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const validated = validateBody(CronJobCreateSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { name, schedule, command, enabled = true } = validated.data;

    const jobs = await ensureCronFile();
    const newJob: CronJob = {
      id: uuidv4(),
      name,
      schedule,
      command,
      enabled,
    };

    jobs.push(newJob);
    await saveCronJobs(jobs);

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Error creating cron job:', error);
    return NextResponse.json({ error: 'Failed to create cron job' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rawPut = await request.json();
    const validatedPut = validateBody(CronJobUpdateSchema, rawPut);
    if (!validatedPut.success) {
      return NextResponse.json({ error: validatedPut.error }, { status: 400 });
    }
    const { id, name, schedule, command, enabled } = validatedPut.data;

    const jobs = await ensureCronFile();
    const jobIndex = jobs.findIndex(job => job.id === id);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...(name !== undefined && { name }),
      ...(schedule !== undefined && { schedule }),
      ...(command !== undefined && { command }),
      ...(enabled !== undefined && { enabled }),
    };

    await saveCronJobs(jobs);

    return NextResponse.json(jobs[jobIndex]);
  } catch (error) {
    console.error('Error updating cron job:', error);
    return NextResponse.json({ error: 'Failed to update cron job' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rawDel = await request.json();
    const validatedDel = validateBody(CronJobDeleteSchema, rawDel);
    if (!validatedDel.success) {
      return NextResponse.json({ error: validatedDel.error }, { status: 400 });
    }
    const { id } = validatedDel.data;

    const jobs = await ensureCronFile();
    const jobIndex = jobs.findIndex(job => job.id === id);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Cron job not found' }, { status: 404 });
    }

    jobs.splice(jobIndex, 1);
    await saveCronJobs(jobs);

    return NextResponse.json({ message: 'Cron job deleted' });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    return NextResponse.json({ error: 'Failed to delete cron job' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import os from 'os';

const execAsync = promisify(exec);

interface HealthCheck {
  name: string;
  status: 'green' | 'yellow' | 'red';
  message: string;
  details?: string;
  latencyMs?: number;
}

interface HealthResponse {
  checks: HealthCheck[];
  overall: 'green' | 'yellow' | 'red';
  timestamp: string;
}

let cachedHealth: HealthResponse | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds

async function checkGatewayStatus(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { stdout, stderr } = await execAsync('openclaw gateway status', { timeout: 5000 });
    const latencyMs = Date.now() - start;
    const output = stdout.toLowerCase();
    
    if (output.includes('running') || output.includes('active') || output.includes('up')) {
      return {
        name: 'Gateway',
        status: 'green',
        message: 'OpenClaw gateway is running',
        latencyMs
      };
    } else {
      return {
        name: 'Gateway',
        status: 'red',
        message: 'Gateway not running',
        details: stdout || stderr,
        latencyMs
      };
    }
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Gateway',
      status: 'red',
      message: 'Failed to check gateway status',
      details: error.message,
      latencyMs
    };
  }
}

async function checkAgentResponsiveness(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const agentsDir = join(os.homedir(), '.openclaw', 'agents');
    const agents = await readdir(agentsDir, { withFileTypes: true });
    const agentDirectories = agents.filter(dirent => dirent.isDirectory());
    
    if (agentDirectories.length === 0) {
      return {
        name: 'Agent Responsiveness',
        status: 'yellow',
        message: 'No agent directories found',
        latencyMs: Date.now() - start
      };
    }

    let recentAgents = 0;
    let stalePivot = 0;
    let oldAgents = 0;
    const now = Date.now();
    
    for (const agent of agentDirectories) {
      try {
        const agentPath = join(agentsDir, agent.name);
        const sessionFiles = await readdir(agentPath);
        
        let latestMtime = 0;
        for (const file of sessionFiles) {
          if (file.endsWith('.md') || file.includes('session')) {
            const filePath = join(agentPath, file);
            const stats = await stat(filePath);
            latestMtime = Math.max(latestMtime, stats.mtime.getTime());
          }
        }
        
        const ageMs = now - latestMtime;
        if (ageMs < 5 * 60 * 1000) { // < 5 minutes
          recentAgents++;
        } else if (ageMs < 60 * 60 * 1000) { // < 1 hour
          stalePivot++;
        } else {
          oldAgents++;
        }
      } catch (err) {
        // Skip agents that can't be read
        continue;
      }
    }

    const latencyMs = Date.now() - start;
    const total = recentAgents + stalePivot + oldAgents;
    
    if (oldAgents > total / 2) {
      return {
        name: 'Agent Responsiveness',
        status: 'red',
        message: `${oldAgents}/${total} agents inactive >1hr`,
        details: `Recent: ${recentAgents}, Stale: ${stalePivot}, Old: ${oldAgents}`,
        latencyMs
      };
    } else if (stalePivot > 0) {
      return {
        name: 'Agent Responsiveness',
        status: 'yellow',
        message: `${stalePivot}/${total} agents inactive 5min-1hr`,
        details: `Recent: ${recentAgents}, Stale: ${stalePivot}, Old: ${oldAgents}`,
        latencyMs
      };
    } else {
      return {
        name: 'Agent Responsiveness',
        status: 'green',
        message: `${recentAgents}/${total} agents active`,
        latencyMs
      };
    }
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Agent Responsiveness',
      status: 'red',
      message: 'Failed to check agent responsiveness',
      details: error.message,
      latencyMs
    };
  }
}

async function checkDiskSpace(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const { stdout } = await execAsync('df -h /', { timeout: 5000 });
    const lines = stdout.trim().split('\n');
    const diskLine = lines[1]; // Skip header line
    const parts = diskLine.split(/\s+/);
    const usagePercent = parseInt(parts[4].replace('%', ''));
    
    const latencyMs = Date.now() - start;
    
    if (usagePercent > 90) {
      return {
        name: 'Disk Space',
        status: 'red',
        message: `Disk usage at ${usagePercent}%`,
        details: diskLine,
        latencyMs
      };
    } else if (usagePercent > 80) {
      return {
        name: 'Disk Space',
        status: 'yellow',
        message: `Disk usage at ${usagePercent}%`,
        details: diskLine,
        latencyMs
      };
    } else {
      return {
        name: 'Disk Space',
        status: 'green',
        message: `Disk usage at ${usagePercent}%`,
        details: diskLine,
        latencyMs
      };
    }
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      name: 'Disk Space',
      status: 'red',
      message: 'Failed to check disk space',
      details: error.message,
      latencyMs
    };
  }
}

async function performHealthChecks(): Promise<HealthResponse> {
  const startTime = Date.now();
  
  // Run all checks in parallel
  const [gatewayCheck, agentCheck, diskCheck] = await Promise.all([
    checkGatewayStatus(),
    checkAgentResponsiveness(),
    checkDiskSpace()
  ]);
  
  // API self-check (response time)
  const apiLatency = Date.now() - startTime;
  const apiCheck: HealthCheck = {
    name: 'API Response',
    status: apiLatency > 2000 ? 'red' : apiLatency > 1000 ? 'yellow' : 'green',
    message: `Response time: ${apiLatency}ms`,
    latencyMs: apiLatency
  };
  
  const checks = [gatewayCheck, agentCheck, diskCheck, apiCheck];
  
  // Determine overall status (worst individual status)
  const statuses = checks.map(c => c.status);
  let overall: 'green' | 'yellow' | 'red' = 'green';
  if (statuses.includes('red')) {
    overall = 'red';
  } else if (statuses.includes('yellow')) {
    overall = 'yellow';
  }
  
  return {
    checks,
    overall,
    timestamp: new Date().toISOString()
  };
}

export async function GET() {
  const now = Date.now();
  
  // Return cached response if still valid
  if (cachedHealth && (now - lastCheckTime) < CACHE_DURATION) {
    return NextResponse.json(cachedHealth);
  }
  
  try {
    const health = await performHealthChecks();
    
    // Cache the response
    cachedHealth = health;
    lastCheckTime = now;
    
    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      {
        checks: [{
          name: 'Health Check System',
          status: 'red' as const,
          message: 'Health check system failed',
          details: error.message
        }],
        overall: 'red' as const,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
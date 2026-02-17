import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

interface SkillInfo {
  name: string;
  description: string;
  path: string;
  source: 'global' | 'agent';
  agent?: string;
  enabled: boolean;
}

async function parseSkillDir(dirPath: string, source: 'global' | 'agent', agent?: string): Promise<SkillInfo[]> {
  const skills: SkillInfo[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (!SAFE_ID_PATTERN.test(entry.name)) continue;
      const skillPath = path.join(dirPath, entry.name);
      const skillMdPath = path.join(skillPath, 'SKILL.md');
      let description = 'No description';
      try {
        const content = await fs.readFile(skillMdPath, 'utf-8');
        const firstLine = content.split('\n').find(l => l.trim() && !l.startsWith('#'))?.trim();
        if (firstLine) description = firstLine;
      } catch (error) { /* SKILL.md may not exist for all skills — expected */ }
      skills.push({
        name: entry.name,
        description,
        path: skillPath,
        source,
        agent,
        enabled: true,
      });
    }
  } catch (error) { console.error(`[skills] Failed to read skills directory: ${dirPath}`, error); }
  return skills;
}

export async function GET() {
  try {
    const allSkills: SkillInfo[] = [];
    
    // Global skills
    const globalSkills = await parseSkillDir(SKILLS_DIR, 'global');
    allSkills.push(...globalSkills);
    
    // Agent workspace skills
    const agentsDir = path.join(OPENCLAW_DIR, 'agents');
    try {
      const agents = await fs.readdir(agentsDir, { withFileTypes: true });
      for (const agent of agents) {
        if (!agent.isDirectory()) continue;
        if (!SAFE_ID_PATTERN.test(agent.name)) continue;
        const agentSkillsDir = path.join(agentsDir, agent.name, 'workspace', 'skills');
        const agentSkills = await parseSkillDir(agentSkillsDir, 'agent', agent.name);
        allSkills.push(...agentSkills);
      }
    } catch (error) { console.error('[skills] Failed to read agent workspace skills', error); }
    
    return NextResponse.json({ skills: allSkills });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read skills' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Calculate date range
    let startDate: Date, endDate: Date;
    const now = new Date();

    switch (range) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'custom':
        if (!fromDate || !toDate) {
          return NextResponse.json({ error: 'From and to dates required for custom range' }, { status: 400 });
        }
        startDate = new Date(fromDate);
        endDate = new Date(toDate);
        break;
      case 'week':
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
    }

    // TODO: Query events table for real data
    // For now, generate mock data
    const totalEvents = Math.floor(Math.random() * 500) + 200;
    const tasksCompleted = Math.floor(Math.random() * 50) + 20;
    const activeProjects = Math.floor(Math.random() * 10) + 5;
    
    // Activity timeline data (events per day)
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      timelineData.push({
        date: date.toISOString().split('T')[0],
        events: Math.floor(Math.random() * 80) + 10
      });
    }

    // Task completion data
    const taskData = {
      completed: tasksCompleted,
      pending: Math.floor(Math.random() * 30) + 10,
      failed: Math.floor(Math.random() * 5) + 1
    };

    // Agent activity data
    const agentData = [
      { agent: 'DEV', events: Math.floor(Math.random() * 50) + 30 },
      { agent: 'QA', events: Math.floor(Math.random() * 40) + 20 },
      { agent: 'PO', events: Math.floor(Math.random() * 35) + 15 },
      { agent: 'PM', events: Math.floor(Math.random() * 30) + 10 },
      { agent: 'OPS', events: Math.floor(Math.random() * 25) + 8 },
    ].sort((a, b) => b.events - a.events);

    // Project status data
    const projectData = [
      { name: 'Grid Dashboard Wave 5', phase: 'development', status: 'active' },
      { name: 'Agent Intelligence System', phase: 'testing', status: 'active' },
      { name: 'Analytics Platform', phase: 'planning', status: 'active' },
      { name: 'Mobile Integration', phase: 'completed', status: 'completed' },
      { name: 'Performance Optimization', phase: 'development', status: 'active' },
    ];

    const reportData = {
      period: {
        range,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      summary: {
        totalEvents,
        tasksCompleted,
        activeProjects,
        generatedAt: new Date().toISOString()
      },
      timeline: timelineData,
      tasks: taskData,
      agents: agentData,
      projects: projectData
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
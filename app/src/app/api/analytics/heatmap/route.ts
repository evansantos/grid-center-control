import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get('agent') || 'all';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Tools in the system
    const tools = [
      'read',
      'write', 
      'exec',
      'web_search',
      'web_fetch',
      'browser',
      'message',
      'tts',
      'sessions_spawn'
    ];

    // Hours 0-23
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Generate mock data (TODO: Query events table for real data)
    // Weight toward working hours (9-18)
    const data = tools.map(tool => 
      hours.map(hour => {
        // Higher probability during working hours
        const isWorkingHours = hour >= 9 && hour <= 18;
        const baseChance = isWorkingHours ? 0.7 : 0.2;
        
        // Different tools have different usage patterns
        let toolMultiplier = 1;
        switch (tool) {
          case 'read':
          case 'write':
            toolMultiplier = isWorkingHours ? 2 : 0.5;
            break;
          case 'exec':
            toolMultiplier = isWorkingHours ? 1.5 : 0.3;
            break;
          case 'web_search':
          case 'web_fetch':
            toolMultiplier = isWorkingHours ? 1.2 : 0.6;
            break;
          case 'browser':
            toolMultiplier = isWorkingHours ? 1.8 : 0.4;
            break;
          case 'message':
            toolMultiplier = 1; // Messages can happen anytime
            break;
          case 'tts':
            toolMultiplier = isWorkingHours ? 0.8 : 0.2;
            break;
          case 'sessions_spawn':
            toolMultiplier = isWorkingHours ? 1.5 : 0.1;
            break;
        }
        
        // Generate call count with some randomness
        const probability = Math.min(baseChance * toolMultiplier, 0.9);
        if (Math.random() > probability) return 0;
        
        return Math.floor(Math.random() * 15) + 1;
      })
    );

    const heatmapData = {
      tools,
      hours,
      data,
      filters: {
        agent,
        fromDate: fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        toDate: toDate || new Date().toISOString().split('T')[0]
      },
      metadata: {
        maxValue: Math.max(...data.flat()),
        totalCalls: data.flat().reduce((sum, val) => sum + val, 0),
        generatedAt: new Date().toISOString()
      }
    };

    return NextResponse.json(heatmapData);
  } catch (error) {
    console.error('Error generating heatmap data:', error);
    return NextResponse.json({ error: 'Failed to generate heatmap data' }, { status: 500 });
  }
}
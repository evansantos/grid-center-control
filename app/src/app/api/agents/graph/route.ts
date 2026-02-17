import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, use hardcoded agent topology
    // TODO: Query events table for spawn relationships
    const graphData = {
      nodes: [
        { id: "CEO", group: "management" },
        { id: "PM", group: "management" },
        { id: "PO", group: "management" },
        { id: "SPEC", group: "engineering" },
        { id: "DEV", group: "engineering" },
        { id: "QA", group: "engineering" },
        { id: "BUG", group: "engineering" },
        { id: "OPS", group: "operations" },
        { id: "DEVOPS", group: "operations" },
        { id: "INFRA", group: "operations" }
      ],
      edges: [
        { source: "CEO", target: "PM" },
        { source: "PM", target: "PO" },
        { source: "PO", target: "SPEC" },
        { source: "SPEC", target: "DEV" },
        { source: "DEV", target: "QA" },
        { source: "QA", target: "BUG" },
        { source: "OPS", target: "DEVOPS" },
        { source: "DEVOPS", target: "INFRA" },
        { source: "PO", target: "DEV" },
        { source: "PM", target: "OPS" }
      ]
    };

    return NextResponse.json(graphData);
  } catch (error) {
    console.error('Error fetching agent graph:', error);
    return NextResponse.json({ error: 'Failed to fetch agent graph' }, { status: 500 });
  }
}
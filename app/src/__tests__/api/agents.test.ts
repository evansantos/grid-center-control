import { GET } from '@/app/api/agents/route';

jest.mock('@/lib/agents', () => ({
  getFullAgentInfo: jest.fn().mockResolvedValue([]),
}));

describe('/api/agents', () => {
  it('GET returns 200 with agents array', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('agents');
    expect(Array.isArray(data.agents)).toBe(true);
  });
});

import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('GET returns 200 with health checks', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('checks');
    expect(data).toHaveProperty('overall');
    expect(data).toHaveProperty('timestamp');
  });
});

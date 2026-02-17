import { GET } from '@/app/api/alerts/route';

jest.mock('@/lib/db', () => ({
  getDB: () => ({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([]),
      get: jest.fn(),
      run: jest.fn(),
    }),
  }),
}));

describe('/api/alerts', () => {
  it('GET returns 200 with alerts array', async () => {
    const req = new Request('http://localhost:3000/api/alerts');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

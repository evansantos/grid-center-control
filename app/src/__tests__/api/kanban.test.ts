import { GET } from '@/app/api/kanban/route';

jest.mock('@/lib/db', () => ({
  getDB: () => ({
    prepare: jest.fn().mockReturnValue({
      all: jest.fn().mockReturnValue([]),
      get: jest.fn(),
      run: jest.fn(),
    }),
  }),
}));

describe('/api/kanban', () => {
  it('GET returns 200 with task columns', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('columns');
    expect(data.columns).toHaveProperty('pending');
    expect(data.columns).toHaveProperty('in_progress');
    expect(data.columns).toHaveProperty('review');
    expect(data.columns).toHaveProperty('done');
  });
});

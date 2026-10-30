import { buildCategoryGroups, fetchCategoryGroups } from './categories';

// Row shape as Supabase's REST API returns it; slugs match the real top-level
// tokens (the app needs them for icons), names are test values.
const row = (id: string, slug: string, parentId: string | null, sort: number) => ({
  id,
  parent_id: parentId,
  slug,
  name: { de: `Test ${slug} DE`, en: `Test ${slug} EN` },
  sort,
});

const rows = [
  row('t1', 'food', null, 10),
  row('t2', 'culture', null, 40),
  row('s2', 'test-sub-b', 't1', 20),
  row('s1', 'test-sub-a', 't1', 10),
  row('s3', 'test-sub-c', 't2', 10),
];

describe('buildCategoryGroups', () => {
  it('nests subcategories under their top-level category, in sort order', () => {
    expect(buildCategoryGroups(rows)).toEqual([
      {
        slug: 'food',
        name: { de: 'Test food DE', en: 'Test food EN' },
        subcategories: [
          { slug: 'test-sub-a', name: { de: 'Test test-sub-a DE', en: 'Test test-sub-a EN' } },
          { slug: 'test-sub-b', name: { de: 'Test test-sub-b DE', en: 'Test test-sub-b EN' } },
        ],
      },
      {
        slug: 'culture',
        name: { de: 'Test culture DE', en: 'Test culture EN' },
        subcategories: [
          { slug: 'test-sub-c', name: { de: 'Test test-sub-c DE', en: 'Test test-sub-c EN' } },
        ],
      },
    ]);
  });

  it('leaves out top-level categories the app has no design token for, with their children', () => {
    const groups = buildCategoryGroups([
      ...rows,
      row('t9', 'test-new-top', null, 5),
      row('s9', 'test-orphan', 't9', 10),
    ]);
    expect(groups.map((group) => group.slug)).toEqual(['food', 'culture']);
  });

  it('rejects malformed rows instead of rendering them', () => {
    expect(() => buildCategoryGroups([{ ...rows[0], name: 'Test' }])).toThrow();
    expect(() => buildCategoryGroups({ message: 'Test error' })).toThrow();
  });
});

describe('fetchCategoryGroups', () => {
  const fetchMock = jest.fn();
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    globalThis.fetch = realFetch;
  });

  it('reads the categories table with the publishable key', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => rows });

    const groups = await fetchCategoryGroups();

    expect(groups).toHaveLength(2);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://test-project.supabase.example.test/rest/v1/categories' +
        '?select=id%2Cparent_id%2Cslug%2Cname%2Csort&order=sort.asc',
    );
    expect(init.headers).toMatchObject({ apikey: 'sb_publishable_test-key' });
  });

  it('turns an HTTP error into a failed query', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    await expect(fetchCategoryGroups()).rejects.toThrow('Supabase categories responded 503');
  });
});

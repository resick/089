import de from './de.json';
import en from './en.json';

type Tree = { [key: string]: string | Tree };

/** Flattens a translation tree into `[ "a.b.c", value ]` pairs. */
function leaves(tree: Tree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [[`${prefix}${key}`, value]] : leaves(value, `${prefix}${key}.`),
  );
}

const variables = (text: string) =>
  [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort();

const index = (tree: Tree) => Object.fromEntries(leaves(tree));

describe('locale files', () => {
  it('de and en define exactly the same keys', () => {
    expect(Object.keys(index(en)).sort()).toEqual(Object.keys(index(de)).sort());
  });

  it('de and en use the same interpolation variables', () => {
    const enIndex = index(en);
    for (const [path, text] of leaves(de)) {
      expect({ path, vars: variables(enIndex[path] ?? '') }).toEqual({
        path,
        vars: variables(text),
      });
    }
  });

  it('has no empty strings', () => {
    const empty = [...leaves(de), ...leaves(en)].filter(([, text]) => text.trim() === '');
    expect(empty).toEqual([]);
  });
});

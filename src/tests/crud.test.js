import { describe, it, expect } from 'vitest';
import { addFiles, deleteFile, renameFile, paginate, pageCount } from '../utils/crudHelpers.js';

const make = (id, name = 'file') => ({ id, name });

describe('addFiles', () => {
  it('appends to empty list', () => expect(addFiles([], [make('1')]).length).toBe(1));
  it('appends multiple', () => expect(addFiles([make('1')], [make('2'), make('3')]).length).toBe(3));
  it('does not mutate original', () => 
  {
    const orig = [make('1')];
    addFiles(orig, [make('2')]);
    expect(orig.length).toBe(1);
  });
});

describe('deleteFile', () => 
{
  it('removes by id', () => expect(deleteFile([make('1'), make('2')], '1').length).toBe(1));
  it('leaves correct item', () => expect(deleteFile([make('1'), make('2')], '1')[0].id).toBe('2'));
  it('no-ops on missing id', () => expect(deleteFile([make('1')], 'x').length).toBe(1));
  it('removes from single-item', () => expect(deleteFile([make('1')], '1').length).toBe(0));
});

describe('renameFile', () => 
{
  it('renames correct file', () => expect(renameFile([make('1', 'old')], '1', 'new')[0].name).toBe('new'));
  it('leaves others unchanged', () => 
  {
    const res = renameFile([make('1', 'a'), make('2', 'b')], '1', 'z');
    expect(res[1].name).toBe('b');
  });
  it('no-ops on missing id', () => expect(renameFile([make('1', 'a')], 'x', 'z')[0].name).toBe('a'));
});

describe('paginate', () => 
{
  const list = Array.from({ length: 25 }, (_, i) => make(String(i)));
  it('returns first 10 on page 1', () => expect(paginate(list, 1).length).toBe(10));
  it('returns correct slice p2', () => expect(paginate(list, 2)[0].id).toBe('10'));
  it('returns remainder on last p', () => expect(paginate(list, 3).length).toBe(5));
  it('empty list returns empty', () => expect(paginate([], 1).length).toBe(0));
});

describe('pageCount', () => 
{
  it('0 items → 1 page', () => expect(pageCount([])).toBe(1));
  it('10 items → 1 page', () => expect(pageCount(new Array(10))).toBe(1));
  it('11 items → 2 pages', () => expect(pageCount(new Array(11))).toBe(2));
  it('30 items → 3 pages', () => expect(pageCount(new Array(30))).toBe(3));
});

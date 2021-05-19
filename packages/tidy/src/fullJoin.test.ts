import { tidy, fullJoin, select, everything } from './index';

describe('fullJoin', () => {
  it('fullJoin works', () => {
    const data = [
      { a: 1, b: 10, c: 100 },
      { a: 2, b: 20, c: 200 },
    ];

    const data2 = [
      { a: 1, x: 'x1', y: 'y1' },
      { a: 5, x: 'x5', y: 'y5' },
    ];
    const results = tidy(
      data,
      fullJoin<typeof data[0], typeof data2[0]>(data2, { by: 'a' })
    );
    expect(results).toEqual([
      { a: 1, b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 2, b: 20, c: 200 },
      { a: 5, x: 'x5', y: 'y5' },
    ]);

    const results4 = tidy(data, fullJoin(data2, { by: ['a'] }));
    expect(results4).toEqual([
      { a: 1, b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 2, b: 20, c: 200 },
      { a: 5, x: 'x5', y: 'y5' },
    ]);

    const results2 = tidy(
      data,
      fullJoin<typeof data[0], typeof data2[0]>(data2, { by: 'a' })
    );
    expect(results2).toEqual([
      { a: 1, b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 2, b: 20, c: 200 },
      { a: 5, x: 'x5', y: 'y5' },
    ]);

    const results3 = tidy(data, fullJoin(data2, { by: { a: 'a' } }));
    expect(results3).toEqual([
      { a: 1, b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 2, b: 20, c: 200 },
      { a: 5, x: 'x5', y: 'y5' },
    ]);
  });

  // note we need this so our lazy functions that just look at first item find all the keys
  it('puts in explicit undefined for columns when there is no joined item', () => {
    const results = tidy(
      [
        { a: 123, b: 345 },
        { a: 452, b: 999 },
      ],
      fullJoin([{ a: 99, c: 124 }], { by: 'a' })
    );

    expect(Object.keys(results[0])).toEqual(['a', 'b', 'c']);
    expect(Object.keys(results[1])).toEqual(['a', 'b', 'c']);
    expect(Object.keys(results[2])).toEqual(['a', 'b', 'c']);

    const results2 = tidy(
      [{ a: 99, c: 456 }],
      fullJoin(
        [
          { a: 123, b: 345 },
          { a: 452, b: 999 },
        ],
        { by: 'a' }
      )
    );

    expect(Object.keys(results2[0])).toEqual(['a', 'c', 'b']);
    expect(Object.keys(results2[1])).toEqual(['a', 'c', 'b']);
    expect(Object.keys(results2[2])).toEqual(['a', 'c', 'b']);
  });

  it('does not lose columns with select', () => {
    const results = tidy(
      [
        { a: 123, b: 345 },
        { a: 452, b: 999 },
      ],
      fullJoin([{ a: 99, c: 456 }], { by: 'a' }),
      select([everything()])
    );

    expect(results).toEqual([
      { a: 123, b: 345, c: undefined },
      { a: 452, b: 999, c: undefined },
      { a: 99, b: undefined, c: 456 },
    ]);

    const results2 = tidy(
      [{ a: 99, c: 456 }],
      fullJoin(
        [
          { a: 123, b: 345 },
          { a: 452, b: 999 },
        ],
        { by: 'a' }
      ),
      select([everything()])
    );

    expect(results2).toEqual([
      { a: 99, c: 456, b: undefined },
      { a: 123, c: undefined, b: 345 },
      { a: 452, c: undefined, b: 999 },
    ]);
  });

  it('fullJoin works with multiple by keys', () => {
    const data = [
      { a: 1, J: 'j', b: 10, c: 100 },
      { a: 1, J: 'k', b: 60, c: 600 },
      { a: 1, J: 'J', b: 30, c: 300 },
      { a: 2, J: 'j', b: 20, c: 200 },
      { a: 3, J: 'x', b: 50, c: 500 },
    ];

    const data2 = [
      { a: 1, J: 'j', altJ: 'j', x: 'x1', y: 'y1' },
      { a: 1, J: 'J', altJ: 'J', x: 'x9', y: 'y9' },
      { a: 2, J: 'j', altJ: 'j', x: 'x2', y: 'y2' },
      { a: 2, J: 'X', altJ: 'x', x: 'x5', y: 'y5' },
    ];
    const results = tidy(
      data,
      fullJoin<typeof data[0], typeof data2[0]>(data2, { by: ['a', 'J'] })
    );
    expect(results).toEqual([
      { a: 1, J: 'j', altJ: 'j', b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 1, J: 'k', b: 60, c: 600 },
      { a: 1, J: 'J', altJ: 'J', b: 30, c: 300, x: 'x9', y: 'y9' },
      { a: 2, J: 'j', altJ: 'j', b: 20, c: 200, x: 'x2', y: 'y2' },
      { a: 3, J: 'x', b: 50, c: 500 },
      { a: 2, J: 'X', altJ: 'x', x: 'x5', y: 'y5' },
    ]);

    expect(tidy(data, fullJoin(data2, { by: { a: 'a', altJ: 'J' } }))).toEqual([
      { a: 1, J: 'j', altJ: 'j', b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 1, J: 'k', b: 60, c: 600 },
      { a: 1, J: 'J', altJ: 'J', b: 30, c: 300, x: 'x9', y: 'y9' },
      { a: 2, J: 'j', altJ: 'j', b: 20, c: 200, x: 'x2', y: 'y2' },
      { a: 3, J: 'x', b: 50, c: 500 },
      { a: 2, J: 'X', altJ: 'x', x: 'x5', y: 'y5' },
    ]);
  });

  it('fullJoin works with auto-detected keys', () => {
    const data = [
      { a: 1, J: 'j', b: 10, c: 100 },
      { a: 1, J: 'k', b: 60, c: 600 },
      { a: 1, J: 'J', b: 30, c: 300 },
      { a: 2, J: 'j', b: 20, c: 200 },
      { a: 3, J: 'x', b: 50, c: 500 },
    ];

    const data2 = [
      { a: 1, J: 'j', altJ: 'j', x: 'x1', y: 'y1' },
      { a: 1, J: 'J', altJ: 'J', x: 'x9', y: 'y9' },
      { a: 2, J: 'j', altJ: 'j', x: 'x2', y: 'y2' },
      { a: 2, J: 'X', altJ: 'x', x: 'x5', y: 'y5' },
    ];
    const results = tidy(
      data,
      fullJoin<typeof data[0], typeof data2[0]>(data2)
    );
    expect(results).toEqual([
      { a: 1, J: 'j', altJ: 'j', b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 1, J: 'k', b: 60, c: 600 },
      { a: 1, J: 'J', altJ: 'J', b: 30, c: 300, x: 'x9', y: 'y9' },
      { a: 2, J: 'j', altJ: 'j', b: 20, c: 200, x: 'x2', y: 'y2' },
      { a: 3, J: 'x', b: 50, c: 500 },
      { a: 2, J: 'X', altJ: 'x', x: 'x5', y: 'y5' },
    ]);
  });

  it('fullJoin works with multiple matching rows', () => {
    const data = [{ a: 1, b: 10, c: 100 }];

    const data2 = [
      { a: 1, x: 'x1', y: 'y1' },
      { a: 1, x: 'x11', y: 'y11' },
      { a: 2, x: 'x2', y: 'y2' },
      { a: 5, x: 'x5', y: 'y5' },
    ];
    const results = tidy(
      data,
      fullJoin<typeof data[0], typeof data2[0]>(data2, { by: 'a' })
    );
    expect(results).toEqual([
      { a: 1, b: 10, c: 100, x: 'x1', y: 'y1' },
      { a: 1, b: 10, c: 100, x: 'x11', y: 'y11' },
      { a: 2, x: 'x2', y: 'y2' },
      { a: 5, x: 'x5', y: 'y5' },
    ]);
  });
});

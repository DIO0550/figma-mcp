import { test, expect } from 'vitest';
import { Version } from '../version.js';
import { createMockVersion, createMockVersions } from './version-test-helpers.js';

test('Version.analyze: バージョンを分析', () => {
  const versions = createMockVersions(6);
  const analysis = Version.analyze(versions);

  expect(analysis.totalVersions).toBe(6);
  expect(analysis.mostActiveUser).toBeDefined();
  expect(analysis.versionsByUser).toBeDefined();
  expect(Object.keys(analysis.versionsByUser)).toHaveLength(3);
  expect(analysis.averageTimeBetweenVersions).toBeGreaterThan(0);
});

test('Version.analyze: 空配列で適切なデフォルト値を返す', () => {
  const analysis = Version.analyze([]);

  expect(analysis).toEqual({
    totalVersions: 0,
    mostActiveUser: null,
    versionsByUser: {},
    averageTimeBetweenVersions: 0,
    majorChanges: [],
  });
});

test('Version.analyze: 単一バージョンの場合', () => {
  const version = createMockVersion('v1', '2024-01-01T00:00:00Z');
  const analysis = Version.analyze([version]);

  expect(analysis.totalVersions).toBe(1);
  expect(analysis.mostActiveUser).toBe('user-1');
  expect(analysis.versionsByUser).toEqual({ 'user-1': 1 });
  expect(analysis.averageTimeBetweenVersions).toBe(0);
});

test('Version.analyze: 大きな変更があったバージョンを特定', () => {
  const versions = [
    { ...createMockVersion('v1', '2024-01-01T00:00:00Z'), componentsChanged: 5 },
    { ...createMockVersion('v2', '2024-01-02T00:00:00Z'), componentsChanged: 15 },
    { ...createMockVersion('v3', '2024-01-03T00:00:00Z'), stylesChanged: 12 },
    { ...createMockVersion('v4', '2024-01-04T00:00:00Z'), componentsChanged: 3, stylesChanged: 2 },
  ];

  const analysis = Version.analyze(versions);

  expect(analysis.majorChanges).toHaveLength(2);
  expect(analysis.majorChanges.map(v => v.id)).toEqual(['v2', 'v3']);
});

test('Version.analyze: 最もアクティブなユーザーを特定', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z', '', '', 'user-1'),
    createMockVersion('v2', '2024-01-02T00:00:00Z', '', '', 'user-1'),
    createMockVersion('v3', '2024-01-03T00:00:00Z', '', '', 'user-2'),
    createMockVersion('v4', '2024-01-04T00:00:00Z', '', '', 'user-1'),
  ];

  const analysis = Version.analyze(versions);

  expect(analysis.mostActiveUser).toBe('user-1');
  expect(analysis.versionsByUser['user-1']).toBe(3);
  expect(analysis.versionsByUser['user-2']).toBe(1);
});

test('Version.analyze: バージョン間の平均時間を計算', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z'),
    createMockVersion('v2', '2024-01-02T00:00:00Z'), // 1日後
    createMockVersion('v3', '2024-01-04T00:00:00Z'), // 2日後
  ];

  const analysis = Version.analyze(versions);

  // 平均は1.5日（ミリ秒）
  const expectedAverage = 1.5 * 24 * 60 * 60 * 1000;
  expect(analysis.averageTimeBetweenVersions).toBe(expectedAverage);
});
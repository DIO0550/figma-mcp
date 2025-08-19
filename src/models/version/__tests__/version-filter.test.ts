import { test, expect } from 'vitest';
import { Version } from '../version.js';
import { createMockVersion, createMockVersions } from './version-test-helpers.js';

test('Version.filterByDateRange: 指定期間内のバージョンをフィルタリング', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z'),
    createMockVersion('v2', '2024-02-01T00:00:00Z'),
    createMockVersion('v3', '2024-03-01T00:00:00Z'),
  ];

  const startDate = new Date('2024-01-15');
  const endDate = new Date('2024-02-15');

  const filtered = Version.filterByDateRange(versions, startDate, endDate);

  expect(filtered).toHaveLength(1);
  expect(filtered[0].id).toBe('v2');
});

test('Version.filterByDateRange: 開始日のみ指定した場合', () => {
  const versions = createMockVersions(3);
  const startDate = new Date('2024-01-02');

  const filtered = Version.filterByDateRange(versions, startDate);

  expect(filtered).toHaveLength(2);
  expect(filtered[0].id).toBe('version-2');
  expect(filtered[1].id).toBe('version-3');
});

test('Version.filterByDateRange: 終了日のみ指定した場合', () => {
  const versions = createMockVersions(3);
  const endDate = new Date('2024-01-02');

  const filtered = Version.filterByDateRange(versions, undefined, endDate);

  expect(filtered).toHaveLength(2);
  expect(filtered[0].id).toBe('version-1');
  expect(filtered[1].id).toBe('version-2');
});

test('Version.filterByDateRange: 日付指定なしの場合は全て返す', () => {
  const versions = createMockVersions(3);

  const filtered = Version.filterByDateRange(versions);

  expect(filtered).toHaveLength(3);
  expect(filtered).toEqual(versions);
});

test('Version.filterByUser: 特定ユーザーのバージョンをフィルタリング', () => {
  const versions = createMockVersions(6); // user-1, user-2, user-3が2回ずつ

  const filtered = Version.filterByUser(versions, 'user-1');

  expect(filtered).toHaveLength(2);
  expect(filtered.every(v => v.user.id === 'user-1')).toBe(true);
});

test('Version.filterByUser: 存在しないユーザーの場合は空配列', () => {
  const versions = createMockVersions(3);

  const filtered = Version.filterByUser(versions, 'non-existent-user');

  expect(filtered).toHaveLength(0);
});

test('Version.getLabeled: ラベル付きバージョンのみ取得', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z', 'Release v1.0'),
    createMockVersion('v2', '2024-01-02T00:00:00Z', ''),
    createMockVersion('v3', '2024-01-03T00:00:00Z', 'Hotfix'),
    createMockVersion('v4', '2024-01-04T00:00:00Z', '   '), // 空白のみ
  ];

  const labeled = Version.getLabeled(versions);

  expect(labeled).toHaveLength(2);
  expect(labeled[0].id).toBe('v1');
  expect(labeled[1].id).toBe('v3');
});
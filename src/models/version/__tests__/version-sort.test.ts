import { test, expect } from 'vitest';
import { Version } from '../version.js';
import { createMockVersion } from './version-test-helpers.js';

test('Version.getLatest: 最新のバージョンを取得', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z'),
    createMockVersion('v3', '2024-03-01T00:00:00Z'),
    createMockVersion('v2', '2024-02-01T00:00:00Z'),
  ];

  const latest = Version.getLatest(versions);

  expect(latest).toBeDefined();
  expect(latest?.id).toBe('v3');
});

test('Version.getLatest: 空配列の場合はnullを返す', () => {
  const latest = Version.getLatest([]);

  expect(latest).toBeNull();
});

test('Version.getLatest: 単一要素の場合はその要素を返す', () => {
  const version = createMockVersion('v1', '2024-01-01T00:00:00Z');
  const latest = Version.getLatest([version]);

  expect(latest).toBe(version);
});

test('Version.sortByDate: 新しい順にソート（デフォルト）', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z'),
    createMockVersion('v3', '2024-03-01T00:00:00Z'),
    createMockVersion('v2', '2024-02-01T00:00:00Z'),
  ];

  const sorted = Version.sortByDate(versions);

  expect(sorted[0].id).toBe('v3');
  expect(sorted[1].id).toBe('v2');
  expect(sorted[2].id).toBe('v1');
  // 元の配列は変更されない
  expect(versions[0].id).toBe('v1');
});

test('Version.sortByDate: 古い順にソート', () => {
  const versions = [
    createMockVersion('v1', '2024-01-01T00:00:00Z'),
    createMockVersion('v3', '2024-03-01T00:00:00Z'),
    createMockVersion('v2', '2024-02-01T00:00:00Z'),
  ];

  const sorted = Version.sortByDate(versions, true);

  expect(sorted[0].id).toBe('v1');
  expect(sorted[1].id).toBe('v2');
  expect(sorted[2].id).toBe('v3');
});

test('Version.sortByDate: 空配列の場合', () => {
  const sorted = Version.sortByDate([]);

  expect(sorted).toEqual([]);
});

test('Version.sortByDate: 同じ日時のバージョンの場合', () => {
  const sameDate = '2024-01-01T00:00:00Z';
  const versions = [
    createMockVersion('v1', sameDate),
    createMockVersion('v2', sameDate),
    createMockVersion('v3', sameDate),
  ];

  const sorted = Version.sortByDate(versions);

  expect(sorted).toHaveLength(3);
  // 同じ日時の場合、元の順序が保持される（stable sort）
});
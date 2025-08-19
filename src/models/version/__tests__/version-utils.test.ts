import { test, expect } from 'vitest';
import { Version } from '../version.js';
import { createMockVersion } from './version-test-helpers.js';

test('Version.compare: 2つのバージョン間の変更を比較', () => {
  const fromVersion = {
    ...createMockVersion('v1', '2024-01-01T00:00:00Z'),
    pagesChanged: ['page1', 'page2'],
    componentsChanged: 5,
    stylesChanged: 3,
  };

  const toVersion = {
    ...createMockVersion('v2', '2024-01-02T00:00:00Z'),
    pagesChanged: ['page2', 'page3'],
    componentsChanged: 8,
    stylesChanged: 2,
  };

  const comparison = Version.compare(fromVersion, toVersion);

  expect(comparison.from).toBe('v1');
  expect(comparison.to).toBe('v2');
  expect(comparison.changes.pagesAdded).toEqual(['page3']);
  expect(comparison.changes.pagesRemoved).toEqual(['page1']);
  expect(comparison.changes.pagesModified).toEqual(['page2']);
  expect(comparison.changes.componentsAdded).toBe(3);
  expect(comparison.changes.stylesAdded).toBe(0);
});

test('Version.compare: 変更がない場合', () => {
  const version = {
    ...createMockVersion('v1', '2024-01-01T00:00:00Z'),
    pagesChanged: ['page1'],
    componentsChanged: 5,
    stylesChanged: 3,
  };

  const comparison = Version.compare(version, version);

  expect(comparison.from).toBe('v1');
  expect(comparison.to).toBe('v1');
  expect(comparison.changes.pagesAdded).toEqual([]);
  expect(comparison.changes.pagesRemoved).toEqual([]);
  expect(comparison.changes.pagesModified).toEqual(['page1']);
});

test('Version.isValidVersionId: 有効なバージョンIDを判定', () => {
  expect(Version.isValidVersionId('123')).toBe(true);
  expect(Version.isValidVersionId('456789')).toBe(true);
  expect(Version.isValidVersionId('0')).toBe(true);
});

test('Version.isValidVersionId: 無効なバージョンIDを判定', () => {
  expect(Version.isValidVersionId('abc')).toBe(false);
  expect(Version.isValidVersionId('123abc')).toBe(false);
  expect(Version.isValidVersionId('v123')).toBe(false);
  expect(Version.isValidVersionId('')).toBe(false);
  expect(Version.isValidVersionId('1.2.3')).toBe(false);
});

test('Version.generateSummary: バージョンの説明を生成', () => {
  const version = {
    ...createMockVersion('v1', '2024-01-01T00:00:00Z', 'Release v1.0'),
    componentsChanged: 10,
    stylesChanged: 5,
    pagesChanged: ['page1', 'page2'],
  };

  const summary = Version.generateSummary(version);

  expect(summary).toContain('Label: Release v1.0');
  expect(summary).toContain('10 component(s) changed');
  expect(summary).toContain('5 style(s) changed');
  expect(summary).toContain('2 page(s) affected');
});

test('Version.generateSummary: ラベルのみの場合', () => {
  const version = createMockVersion('v1', '2024-01-01T00:00:00Z', 'Hotfix');

  const summary = Version.generateSummary(version);

  expect(summary).toBe('Label: Hotfix');
});

test('Version.generateSummary: 変更がない場合', () => {
  const version = createMockVersion('v1', '2024-01-01T00:00:00Z');

  const summary = Version.generateSummary(version);

  expect(summary).toBe('No significant changes');
});

test('Version.generateSummary: 複数の変更タイプがある場合', () => {
  const version = {
    ...createMockVersion('v1', '2024-01-01T00:00:00Z'),
    componentsChanged: 1,
    stylesChanged: 2,
  };

  const summary = Version.generateSummary(version);

  expect(summary).toContain('1 component(s) changed');
  expect(summary).toContain('2 style(s) changed');
  expect(summary).toContain(','); // カンマで区切られている
});
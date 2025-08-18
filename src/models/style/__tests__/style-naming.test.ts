import { test, expect } from 'vitest';
import { Style } from '../style.js';
import { createMockStyle } from './style-test-helpers.js';

test('Style.isHierarchical: 階層的な名前を持つスタイルを正しく判定する', () => {
  const hierarchical = createMockStyle('style-1', 'Colors/Primary/Blue');
  const flat = createMockStyle('style-2', 'SimpleColor');
  
  expect(Style.isHierarchical(hierarchical)).toBe(true);
  expect(Style.isHierarchical(flat)).toBe(false);
});

test('Style.isHierarchical: 単一階層の名前も階層的と判定する', () => {
  const style = createMockStyle('style-1', 'Colors/Blue');
  expect(Style.isHierarchical(style)).toBe(true);
});

test('Style.isHierarchical: 空文字列をフラットと判定する', () => {
  const style = createMockStyle('style-1', '');
  expect(Style.isHierarchical(style)).toBe(false);
});

test('Style.getCategoryPath: 階層的な名前からカテゴリパスを抽出する', () => {
  const style = createMockStyle('style-1', 'Colors/Primary/Blue');
  expect(Style.getCategoryPath(style)).toBe('Colors/Primary');
});

test('Style.getCategoryPath: 単一階層の名前からカテゴリを抽出する', () => {
  const style = createMockStyle('style-1', 'Colors/Blue');
  expect(Style.getCategoryPath(style)).toBe('Colors');
});

test('Style.getCategoryPath: フラットな名前でnullを返す', () => {
  const style = createMockStyle('style-1', 'Blue');
  expect(Style.getCategoryPath(style)).toBeNull();
});

test('Style.getCategoryPath: 空文字列でnullを返す', () => {
  const style = createMockStyle('style-1', '');
  expect(Style.getCategoryPath(style)).toBeNull();
});

test('Style.getBaseName: 階層的な名前からベース名を抽出する', () => {
  const style = createMockStyle('style-1', 'Colors/Primary/Blue');
  expect(Style.getBaseName(style)).toBe('Blue');
});

test('Style.getBaseName: 単一階層の名前からベース名を抽出する', () => {
  const style = createMockStyle('style-1', 'Colors/Blue');
  expect(Style.getBaseName(style)).toBe('Blue');
});

test('Style.getBaseName: フラットな名前でそのまま返す', () => {
  const style = createMockStyle('style-1', 'SimpleColor');
  expect(Style.getBaseName(style)).toBe('SimpleColor');
});

test('Style.getBaseName: 空文字列でそのまま返す', () => {
  const style = createMockStyle('style-1', '');
  expect(Style.getBaseName(style)).toBe('');
});

test('Style.getBaseName: 末尾にスラッシュがある場合も正しく処理する', () => {
  const style = createMockStyle('style-1', 'Colors/Primary/');
  expect(Style.getBaseName(style)).toBe('');
});
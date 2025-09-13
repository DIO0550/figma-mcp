import { test, expect } from 'vitest';
import { camelToSnakeCase } from '../case-converter.js';

// ==============================
// camelToSnakeCase のテスト
// ==============================

test('camelToSnakeCase - converts basic camelCase to snake_case', () => {
  expect(camelToSnakeCase('camelCase')).toBe('camel_case');
  expect(camelToSnakeCase('helloWorld')).toBe('hello_world');
  expect(camelToSnakeCase('userId')).toBe('user_id');
});

test('camelToSnakeCase - converts multiple capital letters', () => {
  expect(camelToSnakeCase('veryLongCamelCaseString')).toBe('very_long_camel_case_string');
  expect(camelToSnakeCase('aBCDE')).toBe('a_b_c_d_e');
});

test('camelToSnakeCase - preserves already snake_case strings', () => {
  expect(camelToSnakeCase('already_snake_case')).toBe('already_snake_case');
  expect(camelToSnakeCase('simple_string')).toBe('simple_string');
});

test('camelToSnakeCase - handles empty string', () => {
  expect(camelToSnakeCase('')).toBe('');
});

test('camelToSnakeCase - handles PascalCase', () => {
  expect(camelToSnakeCase('PascalCase')).toBe('pascal_case');
  expect(camelToSnakeCase('Component')).toBe('component');
});

test('camelToSnakeCase - handles all defined acronyms correctly', () => {
  // HTTPS
  expect(camelToSnakeCase('HTTPSConnection')).toBe('https_connection');
  expect(camelToSnakeCase('getHTTPSUrl')).toBe('get_https_url');
  expect(camelToSnakeCase('isHTTPS')).toBe('is_https');

  // HTTP
  expect(camelToSnakeCase('HTTPResponse')).toBe('http_response');
  expect(camelToSnakeCase('getHTTPHeader')).toBe('get_http_header');
  expect(camelToSnakeCase('useHTTP')).toBe('use_http');

  // XML
  expect(camelToSnakeCase('XMLParser')).toBe('xml_parser');
  expect(camelToSnakeCase('parseXMLData')).toBe('parse_xml_data');
  expect(camelToSnakeCase('toXML')).toBe('to_xml');

  // URL
  expect(camelToSnakeCase('URLBuilder')).toBe('url_builder');
  expect(camelToSnakeCase('buildURLPath')).toBe('build_url_path');
  expect(camelToSnakeCase('isURL')).toBe('is_url');

  // API
  expect(camelToSnakeCase('APIKey')).toBe('api_key');
  expect(camelToSnakeCase('callAPIEndpoint')).toBe('call_api_endpoint');
  expect(camelToSnakeCase('restAPI')).toBe('rest_api');

  // JSON
  expect(camelToSnakeCase('JSONData')).toBe('json_data');
  expect(camelToSnakeCase('parseJSONString')).toBe('parse_json_string');
  expect(camelToSnakeCase('toJSON')).toBe('to_json');

  // SVG
  expect(camelToSnakeCase('SVGElement')).toBe('svg_element');
  expect(camelToSnakeCase('renderSVGIcon')).toBe('render_svg_icon');
  expect(camelToSnakeCase('isSVG')).toBe('is_svg');

  // PDF
  expect(camelToSnakeCase('PDFDocument')).toBe('pdf_document');
  expect(camelToSnakeCase('generatePDFReport')).toBe('generate_pdf_report');
  expect(camelToSnakeCase('toPDF')).toBe('to_pdf');

  // IO
  expect(camelToSnakeCase('IOError')).toBe('io_error');
  expect(camelToSnakeCase('handleIOException')).toBe('handle_io_exception');
  expect(camelToSnakeCase('fileIO')).toBe('file_io');

  // ID
  expect(camelToSnakeCase('userID')).toBe('user_id');
  expect(camelToSnakeCase('getIDValue')).toBe('get_id_value');
  expect(camelToSnakeCase('hasID')).toBe('has_id');
});

test('camelToSnakeCase - handles multiple acronyms in one string', () => {
  expect(camelToSnakeCase('HTTPSAPIURLBuilder')).toBe('https_api_url_builder');
  expect(camelToSnakeCase('XMLHTTPRequest')).toBe('xml_http_request');
  expect(camelToSnakeCase('JSONAPIResponse')).toBe('json_api_response');
  expect(camelToSnakeCase('PDFIOHandler')).toBe('pdf_io_handler');
});

test('camelToSnakeCase - handles numbers correctly', () => {
  expect(camelToSnakeCase('field1')).toBe('field1');
  expect(camelToSnakeCase('userId123')).toBe('user_id123');
  expect(camelToSnakeCase('test2Value')).toBe('test2_value');
  expect(camelToSnakeCase('value123Test')).toBe('value123_test');
  expect(camelToSnakeCase('test4Value')).toBe('test4_value');
});

test('camelToSnakeCase - handles strings with only underscores', () => {
  expect(camelToSnakeCase('___')).toBe('___');
  expect(camelToSnakeCase('_')).toBe('_');
});

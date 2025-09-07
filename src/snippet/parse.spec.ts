/**
 * Snippet Parse Function Tests
 * Tests the snippet parsing with file path detection and metadata extraction
 */

import { describe, it, expect, vi } from 'vitest';
import { parse } from './parse.js';

describe('snippet parse function', () => {
  describe('inline code processing', () => {
    it('should handle simple inline code', async () => {
      const result = await parse('console.log("hello");');

      expect(result).toEqual({
        code: 'console.log("hello");',
        lang: 'js',
        test: false,
      });
    });

    it('should handle multiline inline code', async () => {
      const code = `function test() {\n  return 42;\n}`;
      const result = await parse(code);

      expect(result.code).toBe(code);
      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
    });

    it('should handle empty inline code', async () => {
      const result = await parse('');

      expect(result).toEqual({
        code: '',
        lang: 'js',
        test: false,
      });
    });
  });

  describe('file path detection', () => {
    it('should detect relative file paths', async () => {
      const result = await parse('./test.js');

      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
      expect(result.code).toContain('Stub content for ./test.js');
    });

    it('should detect parent directory paths', async () => {
      const result = await parse('../utils/helper.js');

      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
      expect(result.code).toContain('Stub content for ../utils/helper.js');
    });

    it('should detect absolute paths', async () => {
      const result = await parse('/src/components/Button.tsx');

      expect(result.lang).toBe('js'); // tsx -> js mapping
      expect(result.test).toBe(false);
      expect(result.code).toContain('Stub content for /src/components/Button.tsx');
    });

    it('should detect file extensions without paths', async () => {
      const result = await parse('module.mjs');

      expect(result.lang).toBe('js'); // mjs -> js mapping
      expect(result.test).toBe(false);
      expect(result.code).toContain('Stub content for module.mjs');
    });
  });

  describe('language detection from extension', () => {
    it('should detect JavaScript files', async () => {
      const jsResult = await parse('./file.js');
      const mjsResult = await parse('./module.mjs');
      const tsResult = await parse('./types.ts');
      const jsxResult = await parse('./component.jsx');
      const tsxResult = await parse('./component.tsx');

      expect(jsResult.lang).toBe('js');
      expect(mjsResult.lang).toBe('js');
      expect(tsResult.lang).toBe('js');
      expect(jsxResult.lang).toBe('js');
      expect(tsxResult.lang).toBe('js');
    });

    it('should detect Python files', async () => {
      const result = await parse('./script.py');

      expect(result.lang).toBe('python');
    });

    it('should detect other language files', async () => {
      const rubyResult = await parse('./script.rb');
      const goResult = await parse('./main.go');
      const rustResult = await parse('./lib.rs');
      const javaResult = await parse('./Main.java');
      const cppResult = await parse('./program.cpp');
      const cResult = await parse('./program.c');
      const csharpResult = await parse('./Program.cs');

      expect(rubyResult.lang).toBe('ruby');
      expect(goResult.lang).toBe('go');
      expect(rustResult.lang).toBe('rust');
      expect(javaResult.lang).toBe('java');
      expect(cppResult.lang).toBe('cpp');
      expect(cResult.lang).toBe('c');
      expect(csharpResult.lang).toBe('csharp');
    });

    it('should default to js for unknown extensions', async () => {
      const result = await parse('./file.unknown');

      expect(result.lang).toBe('js');
    });
  });

  describe('test flag detection', () => {
    it('should detect .test. in filename', async () => {
      const result = await parse('./math.test.js');

      expect(result.test).toBe(true);
      expect(result.lang).toBe('js');
    });

    it('should detect .spec. in filename', async () => {
      const result = await parse('./validation.spec.ts');

      expect(result.test).toBe(true);
      expect(result.lang).toBe('js');
    });

    it('should not flag non-test files', async () => {
      const result = await parse('./regular.js');

      expect(result.test).toBe(false);
    });

    it('should handle test files with complex names', async () => {
      const result1 = await parse('./component.test.integration.js');
      const result2 = await parse('./utils.spec.unit.ts');

      expect(result1.test).toBe(true);
      expect(result2.test).toBe(true);
    });
  });

  describe('options override', () => {
    it('should override language detection', async () => {
      const result = await parse('./file.js', { lang: 'python' });

      expect(result.lang).toBe('python');
    });

    it('should override test flag detection', async () => {
      const result1 = await parse('./regular.js', { test: true });
      const result2 = await parse('./math.test.js', { test: false });

      expect(result1.test).toBe(true);
      expect(result2.test).toBe(false);
    });

    it('should apply options to inline code', async () => {
      const result = await parse('console.log("test");', {
        lang: 'typescript',
        test: true,
      });

      expect(result.code).toBe('console.log("test");');
      expect(result.lang).toBe('typescript');
      expect(result.test).toBe(true);
    });

    it('should handle partial options', async () => {
      const result1 = await parse('./file.py', { lang: 'javascript' });
      const result2 = await parse('./file.js', { test: true });

      expect(result1.lang).toBe('javascript');
      expect(result1.test).toBe(false); // Should use detected value

      expect(result2.lang).toBe('js'); // Should use detected value
      expect(result2.test).toBe(true);
    });

    it('should handle empty options object', async () => {
      const result = await parse('./test.js', {});

      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle files with multiple dots', async () => {
      const result = await parse('./file.min.js');

      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
    });

    it('should handle files without extensions', async () => {
      const result = await parse('./README');

      expect(result.lang).toBe('js'); // Default fallback
      expect(result.test).toBe(false);
    });

    it('should handle very long file paths', async () => {
      const longPath = './very/deep/nested/directory/structure/file.js';
      const result = await parse(longPath);

      expect(result.lang).toBe('js');
      expect(result.code).toContain(longPath);
    });

    it('should handle paths with special characters', async () => {
      const specialPath = './files/test-file_2023.spec.js';
      const result = await parse(specialPath);

      expect(result.lang).toBe('js');
      expect(result.test).toBe(true);
    });

    it('should handle Windows-style paths', async () => {
      const windowsPath = '.\\src\\components\\Button.tsx';
      const result = await parse(windowsPath);

      expect(result.lang).toBe('js');
      expect(result.code).toContain(windowsPath);
    });
  });

  describe('stub behavior (current implementation)', () => {
    it('should log warning for file paths', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await parse('./example.js');

      expect(consoleSpy).toHaveBeenCalledWith('[STUB] Would load file: ./example.js');

      consoleSpy.mockRestore();
    });

    it('should return consistent stub content', async () => {
      const result1 = await parse('./file1.js');
      const result2 = await parse('./file2.js');

      expect(result1.code).toContain('Stub content for ./file1.js');
      expect(result2.code).toContain('Stub content for ./file2.js');
      expect(result1.code).not.toEqual(result2.code); // Different file names
    });

    it('should generate valid JavaScript in stub', async () => {
      const result = await parse('./test.js');

      expect(result.code).toContain('console.log(');
      expect(result.code).toContain('File loaded!');
    });
  });

  describe('function signature compatibility', () => {
    it('should work with no options parameter', async () => {
      const result = await parse('test code');

      expect(result.code).toBe('test code');
      expect(result.lang).toBe('js');
      expect(result.test).toBe(false);
    });

    it('should be async function', () => {
      expect(parse.constructor.name).toBe('AsyncFunction');
    });

    it('should return Promise', () => {
      const result = parse('test');

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('integration scenarios', () => {
    it('should work with typical web project files', async () => {
      const scenarios = [
        { path: './src/components/Header.tsx', expectedLang: 'js', expectedTest: false },
        { path: './src/utils/helpers.js', expectedLang: 'js', expectedTest: false },
        { path: './tests/unit/Header.test.tsx', expectedLang: 'js', expectedTest: true },
        { path: './scripts/build.mjs', expectedLang: 'js', expectedTest: false },
        { path: './api/routes.spec.ts', expectedLang: 'js', expectedTest: true },
      ];

      for (const scenario of scenarios) {
        const result = await parse(scenario.path);
        expect(result.lang).toBe(scenario.expectedLang);
        expect(result.test).toBe(scenario.expectedTest);
      }
    });

    it('should maintain consistency with snippet.wc component', async () => {
      // This function should have same signature and behavior as used by snippet.wc
      const pathResult = await parse('./example.js', { lang: 'typescript' });
      const inlineResult = await parse('inline code', { test: true });

      expect(pathResult.lang).toBe('typescript'); // Option override
      expect(inlineResult.test).toBe(true); // Option override
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import Prompt, { MissingVariablesError, NamespaceUndefinedError, LoadFileReadError, load } from './Prompt';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Prompt - Basic Functionality', () => {
    it('should create a prompt with a simple string', () => {
        const prompt = new Prompt('Hello, world!');
        expect(prompt.value).toBe('Hello, world!');
        expect(prompt.promptString).toBe('Hello, world!');
    });

    it('should interpolate single variable', () => {
        const prompt = new Prompt('Hello, {{name}}!', { name: 'Alice' });
        expect(prompt.value).toBe('Hello, Alice!');
    });

    it('should interpolate multiple variables', () => {
        const prompt = new Prompt('{{greeting}}, {{name}}! You are {{age}} years old.', {
            greeting: 'Hello',
            name: 'Bob',
            age: 30
        });
        expect(prompt.value).toBe('Hello, Bob! You are 30 years old.');
    });

    it('should handle variables with spaces in placeholders', () => {
        const prompt = new Prompt('Hello, {{ name }}!', { name: 'Charlie' });
        expect(prompt.value).toBe('Hello, Charlie!');
    });

    it('should stringify object variables', () => {
        const prompt = new Prompt('Data: {{data}}', { data: { key: 'value', count: 42 } });
        expect(prompt.value).toBe('Data: {"key":"value","count":42}');
    });

    it('should stringify array variables', () => {
        const prompt = new Prompt('Items: {{items}}', { items: [1, 2, 3] });
        expect(prompt.value).toBe('Items: [1,2,3]');
    });

    it('should throw MissingVariablesError when variable is not provided', () => {
        expect(() => {
            new Prompt('Hello, {{name}}!', {});
        }).toThrow(MissingVariablesError);
    });

    it('should throw with correct missing variable names', () => {
        try {
            new Prompt('Hello, {{name}}! You are {{age}} years old.', { name: 'Dave' });
        } catch (error) {
            expect(error).toBeInstanceOf(MissingVariablesError);
            expect((error as MissingVariablesError).variables).toEqual(['age']);
        }
    });

    it('should not interpolate variables inside code blocks', () => {
        const promptText = 'Before\n```\n{{code}}\n```\nAfter {{var}}';
        const prompt = new Prompt(promptText, { var: 'test' });
        expect(prompt.value).toBe('Before\n```\n{{code}}\n```\nAfter test');
    });
});

describe('Prompt - setVariables', () => {
    it('should update variables and re-interpolate', () => {
        const prompt = new Prompt('Hello, {{name}}!', { name: 'Alice' });
        expect(prompt.value).toBe('Hello, Alice!');
        
        prompt.setVariables({ name: 'Bob' });
        expect(prompt.value).toBe('Hello, Bob!');
    });

    it('should throw when updating with missing variables', () => {
        const prompt = new Prompt('Hello, {{name}}!', { name: 'Alice' });
        
        expect(() => {
            prompt.setVariables({});
        }).toThrow(MissingVariablesError);
    });

    it('should access variables getter', () => {
        const vars = { name: 'Alice', age: 25 };
        const prompt = new Prompt('{{name}} is {{age}}', vars);
        expect(prompt.variables).toEqual(vars);
    });
});

describe('Prompt - load function', () => {
    const testDir = path.join(__dirname, 'test-prompts');

    beforeEach(() => {
        // Clean up and create test directory
        try {
            rmSync(testDir, { recursive: true, force: true });
        } catch (e) {}
        mkdirSync(testDir, { recursive: true });
    });

    it('should load prompt from file with __dirname basePath', () => {
        const testFile = path.join(testDir, 'test.md');
        writeFileSync(testFile, 'Hello from file! {{name}}');

        const prompt = new Prompt(
            load('test-prompts/test.md', __dirname),
            { name: 'FileUser' }
        );

        expect(prompt.value).toBe('Hello from file! FileUser');
    });

    it('should load prompt from file with relative path', () => {
        const testFile = path.join(testDir, 'simple.md');
        writeFileSync(testFile, 'Simple content');

        // Use process.cwd() as base
        const prompt = new Prompt(
            load(`test-prompts/simple.md`, process.cwd()),
            {}
        );

        expect(prompt.value).toBe('Simple content');
    });

    it('should automatically add .md extension if not provided', () => {
        const testFile = path.join(testDir, 'noext.md');
        writeFileSync(testFile, 'No extension needed');

        const prompt = new Prompt(
            load('test-prompts/noext', __dirname),
            {}
        );

        expect(prompt.value).toBe('No extension needed');
    });

    it('should load prompt with variables from file', () => {
        const testFile = path.join(testDir, 'vars.md');
        writeFileSync(testFile, 'User {{user}} has {{count}} items');

        const prompt = new Prompt(
            load('test-prompts/vars.md', __dirname),
            { user: 'John', count: 5 }
        );

        expect(prompt.value).toBe('User John has 5 items');
    });

    it('should throw LoadFileReadError for non-existent file', () => {
        expect(() => {
            new Prompt(load('test-prompts/nonexistent.md', __dirname), {});
        }).toThrow(LoadFileReadError);
    });

    it('should work with path aliases', () => {
        const testFile = path.join(testDir, 'aliased.md');
        writeFileSync(testFile, 'Aliased content');

        Prompt.pathAlias = {
            testprompts: 'test-prompts'
        };

        const prompt = new Prompt(
            load('@testprompts/aliased.md', __dirname),
            {}
        );

        expect(prompt.value).toBe('Aliased content');
        
        // Clean up
        Prompt.pathAlias = {};
    });

    it('should throw NamespaceUndefinedError for undefined alias', () => {
        expect(() => {
            new Prompt(load('@undefined/file.md', __dirname), {});
        }).toThrow(NamespaceUndefinedError);
    });

    it('should handle nested directories', () => {
        const nestedDir = path.join(testDir, 'nested', 'deep');
        mkdirSync(nestedDir, { recursive: true });
        const testFile = path.join(nestedDir, 'nested.md');
        writeFileSync(testFile, 'Nested content');

        const prompt = new Prompt(
            load('test-prompts/nested/deep/nested.md', __dirname),
            {}
        );

        expect(prompt.value).toBe('Nested content');
    });
});

describe('Prompt - Error Classes', () => {
    it('should create MissingVariablesError with correct properties', () => {
        const error = new MissingVariablesError(['var1', 'var2'], 'test prompt');
        expect(error.name).toBe('MissingVariablesError');
        expect(error.variables).toEqual(['var1', 'var2']);
        expect(error.message).toContain('var1');
        expect(error.message).toContain('var2');
    });

    it('should create NamespaceUndefinedError with correct properties', () => {
        const error = new NamespaceUndefinedError('@missing');
        expect(error.name).toBe('NamespaceUndefinedError');
        expect(error.namespace).toBe('@missing');
        expect(error.message).toContain('@missing');
    });

    it('should create LoadFileReadError with correct properties', () => {
        const originalError = new Error('File not found');
        const error = new LoadFileReadError('/path/to/file', originalError);
        expect(error.name).toBe('LoadFileReadError');
        expect(error.filePath).toBe('/path/to/file');
        expect(error.originalError).toBe(originalError);
    });
});

describe('Prompt - Edge Cases', () => {
    it('should handle empty string prompt', () => {
        const prompt = new Prompt('', {});
        expect(prompt.value).toBe('');
    });

    it('should handle prompt with no variables', () => {
        const prompt = new Prompt('Just plain text', {});
        expect(prompt.value).toBe('Just plain text');
    });

    it('should handle duplicate variable placeholders', () => {
        const prompt = new Prompt('{{x}} + {{x}} = {{result}}', { x: 5, result: 10 });
        expect(prompt.value).toBe('5 + 5 = 10');
    });

    it('should handle special characters in variable values', () => {
        const prompt = new Prompt('Message: {{msg}}', { 
            msg: 'Special chars: !@#$%^&*()' 
        });
        expect(prompt.value).toBe('Message: Special chars: !@#$%^&*()');
    });

    it('should handle numeric variables', () => {
        const prompt = new Prompt('Count: {{count}}', { count: 42 });
        expect(prompt.value).toBe('Count: 42');
    });

    it('should handle boolean variables', () => {
        const prompt = new Prompt('Active: {{active}}', { active: true });
        expect(prompt.value).toBe('Active: true');
    });

    it('should handle null and undefined by stringifying', () => {
        const prompt = new Prompt('Null: {{n}}, Undefined: {{u}}', { 
            n: null, 
            u: undefined 
        });
        expect(prompt.value).toContain('null');
        expect(prompt.value).toContain('undefined');
    });
});

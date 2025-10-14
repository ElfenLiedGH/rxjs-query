import { flatConfigs as importXConfigs } from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import { configs as reactCompilerConfigs } from 'eslint-plugin-react-compiler';
import reactDom from 'eslint-plugin-react-dom';
import {
    rules as hooksRules,
    configs as hooksConfigs,
    meta as hooksMeta,
} from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tsEslint, { configs as tsEslintConfigs } from 'typescript-eslint';
import js from '@eslint/js';

export default tsEslint.config(
    {
        ignores: ['dist', 'dev-dist', 'public', 'node_modules', 'storybook-static'],
    },
    {
        extends: [
            js.configs.recommended,
            tsEslintConfigs.recommended,
            reactPlugin.configs.flat.recommended,
            reactPlugin.configs.flat['jsx-runtime'],
            importXConfigs.recommended,
            importXConfigs.typescript,
            reactCompilerConfigs.recommended,
        ],
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import-x/resolver': {
                typescript: true,
            },
        },
        plugins: {
            'react-dom': reactDom,
            'react-hooks': {
                rules: hooksRules,
                meta: hooksMeta,
            },
            'react-refresh': reactRefresh,
            prettier,
        },
        rules: {
            // 'import-x/no-cycle': ['error', { maxDepth: Infinity }], // NOSONAR
            ...reactDom.configs.recommended.rules,
            ...hooksConfigs.recommended.rules,
            curly: [2, 'all'],
            'arrow-body-style': ['error', 'as-needed'],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-curly-brace-presence': [
                'error',
                {
                    props: 'never',
                    children: 'never',
                    propElementValues: 'always',
                },
            ],
            'react-hooks/exhaustive-deps': 'error',
            'react-compiler/react-compiler': 'error',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],
            'import-x/no-unresolved': 'off',
            'import-x/order': [
                // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'type',
                        'object',
                        'unknown',
                    ],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before',
                        },
                        {
                            pattern:
                                '@{tanstack,rtk,reduxjs,hookform,vis.gl,@react-three}/**',
                            group: 'external',
                        },
                        {
                            pattern: '@{**/**,**}',
                            group: 'internal',
                        },
                        {
                            pattern: '*.{less,css}',
                            patternOptions: { dot: true, nocomment: true, matchBase: true },
                            group: 'unknown',
                            position: 'after',
                        },
                    ],
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    warnOnUnassignedImports: true,
                    pathGroupsExcludedImportTypes: ['builtin'],
                },
            ],
        },
    },
    {
        files: ['src/features/api/generated/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    }
);

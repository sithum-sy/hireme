import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx}'],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                process: 'readonly',
                global: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                FormData: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                Image: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                alert: 'readonly',
            },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off', // Not needed in React 17+
            'react/prop-types': 'warn',
            'no-unused-vars': 'warn',
            'no-console': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        ignores: ['vendor/', 'node_modules/', 'public/build/', 'storage/', 'bootstrap/cache/'],
    },
];
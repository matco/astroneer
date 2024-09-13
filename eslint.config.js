import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommendedTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		ignores: ['dist/*', 'src/tools/*', 'webpack*'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			globals: {
				...globals.browser
			},
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'array-callback-return': 'error',
			'consistent-return': 'error',
			'curly': 'error',
			'eol-last': 'error',
			'eqeqeq': 'error',
			'indent': ['error', 'tab', {'SwitchCase': 1}],
			'key-spacing': 'error',
			'linebreak-style': ['error', 'unix'],
			'no-console': 'off',
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': 'error',
			'no-new-wrappers': 'error',
			'no-proto': 'error',
			'no-prototype-builtins': 'off',
			'no-undef': 'error',
			'no-var': 'error',
			'no-with': 'error',
			'prefer-const': 'error',
			'prefer-template': 'error',
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'spaced-comment': ['error', 'never'],
			'strict': 'error',
			'template-curly-spacing': ['error', 'never'],
			'@typescript-eslint/unbound-method': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/dot-notation': 'off'
		}
	}
);

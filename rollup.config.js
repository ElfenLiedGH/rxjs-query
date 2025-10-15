import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.esm.js',
                format: 'esm',
                sourcemap: true
            },
            {
                file: 'dist/index.cjs.js',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [
            resolve({ browser: true }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                exclude: ['**/*.test.ts']
            })
        ]
    },
    {
        input: 'dist/types/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()]
    }
];
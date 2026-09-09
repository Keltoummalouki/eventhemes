import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      // Les visuels distants viennent de CDN et s'appuient sur un repli onError :
      // la balise <img> native est volontaire (voir components/ui/SmartImage).
      '@next/next/no-img-element': 'off',
    },
  },
];

export default eslintConfig;

/** @type {import('prettier').Config} */
const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  tailwindFunctions: ['cn', 'cva', 'clsx'],
  tailwindStylesheet: './src/index.css',
}

export default config

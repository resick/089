import { palette, type ColorToken } from '@089/tokens';

const toVar = (token: string) => `--color-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function declarations(scheme: 'dark' | 'light') {
  return (Object.entries(palette[scheme]) as [ColorToken, string][])
    .map(([token, value]) => `${toVar(token)}:${value};`)
    .join('');
}

/**
 * Colour tokens as CSS custom properties. Dark is the default (dark-first
 * design); light applies when the OS prefers it.
 */
export const themeCss =
  `:root{color-scheme:dark light;${declarations('dark')}}` +
  `@media (prefers-color-scheme: light){:root{${declarations('light')}}}`;

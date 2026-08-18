import { stripLayerWrappers } from './vuetify-layer-fallback';

const normalize = (css) => css.replace(/\s+/g, ' ').trim();

describe('stripLayerWrappers', () => {
  test('returns input unchanged when no @layer rules are present', () => {
    const css = '.foo { color: red; } .bar { background: blue; }';
    expect(stripLayerWrappers(css)).toBe(css);
  });

  test('returns empty string for empty input', () => {
    expect(stripLayerWrappers('')).toBe('');
  });

  test('strips a single top-level @layer block and keeps inner rules', () => {
    const input = '@layer foo { .a { color: red; } }';
    expect(normalize(stripLayerWrappers(input))).toBe('.a { color: red; }');
  });

  test('removes @layer declaration statements (no body)', () => {
    const input = '@layer core, components, utilities; .a { color: red; }';
    expect(normalize(stripLayerWrappers(input))).toBe('.a { color: red; }');
  });

  test('strips multiple sibling @layer blocks', () => {
    const input = '@layer a { .x { color: red; } } @layer b { .y { color: blue; } }';
    expect(normalize(stripLayerWrappers(input))).toBe('.x { color: red; } .y { color: blue; }');
  });

  test('strips nested @layer blocks while preserving inner declarations', () => {
    const input = '@layer outer { @layer inner { .z { color: green; } } }';
    expect(normalize(stripLayerWrappers(input))).toBe('.z { color: green; }');
  });

  test('preserves non-@layer at-rules (e.g. @media) inside a layer', () => {
    const input = '@layer utils { @media (min-width: 600px) { .r { color: red; } } }';
    expect(normalize(stripLayerWrappers(input)))
      .toBe('@media (min-width: 600px) { .r { color: red; } }');
  });

  test('preserves @keyframes nested inside a layer', () => {
    const input = '@layer anim { @keyframes spin { from { opacity: 0; } to { opacity: 1; } } }';
    expect(normalize(stripLayerWrappers(input)))
      .toBe('@keyframes spin { from { opacity: 0; } to { opacity: 1; } }');
  });

  test('handles empty @layer block', () => {
    const input = '@layer empty { } .a { color: red; }';
    expect(normalize(stripLayerWrappers(input))).toBe('.a { color: red; }');
  });

  test('does not strip braces from regular rules that happen to be adjacent to @layer', () => {
    const input = '.before { margin: 0; } @layer x { .inside { padding: 0; } } .after { border: 0; }';
    expect(normalize(stripLayerWrappers(input)))
      .toBe('.before { margin: 0; } .inside { padding: 0; } .after { border: 0; }');
  });

  test('handles realistic Vuetify 4 runtime theme stylesheet shape', () => {
    const input = `
      @layer vuetify-utilities {
        @layer theme-base {
          :root {
            --v-theme-primary: 46,204,113;
            --v-theme-on-surface: 255,255,255;
          }
          .v-theme--light {
            --v-theme-primary: 46,204,113;
          }
        }
        @layer theme-background {
          .bg-primary {
            background-color: rgb(var(--v-theme-primary));
            color: rgb(var(--v-theme-on-primary));
          }
        }
        @layer theme-foreground {
          .text-primary {
            color: rgb(var(--v-theme-primary));
          }
        }
      }
    `;

    const output = stripLayerWrappers(input);

    expect(output).not.toContain('@layer');
    expect(output).toContain('--v-theme-primary: 46,204,113');
    expect(output).toContain('.bg-primary');
    expect(output).toContain('.text-primary');
    expect(output).toContain('background-color: rgb(var(--v-theme-primary))');
  });

  test('leaves layered-rule braces balanced when inner rules contain nested blocks', () => {
    const input = '@layer base { .a { color: red; } .b:hover { color: blue; } }';
    const output = stripLayerWrappers(input);
    const openCount = (output.match(/\{/g) || []).length;
    const closeCount = (output.match(/\}/g) || []).length;
    expect(openCount).toBe(closeCount);
  });
});

// Vuetify 4 injects a runtime stylesheet (#vuetify-theme-stylesheet) that wraps
// --v-theme-* custom properties and .bg-*/.text-* utility classes in @layer
// blocks (theme-base / theme-background / theme-foreground / vuetify-utilities).
//
// Two failure modes this script handles:
//
// 1. Browsers without @layer support (Chrome <99, Firefox <97, Safari <15.4)
//    discard all rules inside @layer blocks, so theme variables never apply.
//
// 2. Even in modern browsers, @csstools/postcss-cascade-layers transforms the
//    *static* CSS to unlayered rules with specificity bumps. Per CSS spec, any
//    real-layered rule is lower priority than any unlayered rule, so the
//    runtime theme utility classes lose to component base styles (e.g. button
//    colors disappear). Keeping runtime and static CSS in the same unlayered
//    cascade restores expected behavior.
//
// We therefore strip runtime @layer wrappers on every browser.

const LAYER_KEYWORD = '@layer';
const LAYER_KEYWORD_LENGTH = LAYER_KEYWORD.length;
const STYLE_ID = 'vuetify-theme-stylesheet';

const findAtRuleEnd = (css, start) => {
  const openBrace = css.indexOf('{', start);
  const semi = css.indexOf(';', start);
  if (semi !== -1 && (openBrace === -1 || semi < openBrace)) {
    return { kind: 'statement', end: semi + 1 };
  }
  if (openBrace !== -1) {
    return { kind: 'block', end: openBrace + 1 };
  }
  return { kind: 'none', end: css.length };
};

const handleLayerAtRule = (css, index, stack) => {
  const result = findAtRuleEnd(css, index);
  if (result.kind === 'block') stack.push('layer');
  return result.end;
};

export const stripLayerWrappers = (css) => {
  const parts = [];
  const stack = [];
  let i = 0;
  while (i < css.length) {
    if (css.substr(i, LAYER_KEYWORD_LENGTH) === LAYER_KEYWORD) {
      i = handleLayerAtRule(css, i, stack);
      continue;
    }
    const ch = css[i];
    if (ch === '{') {
      stack.push('block');
      parts.push(ch);
    } else if (ch === '}') {
      const top = stack.pop();
      if (top !== 'layer') parts.push(ch);
    } else {
      parts.push(ch);
    }
    i += 1;
  }
  return parts.join('');
};

const lastProcessed = new WeakMap();

const normalize = (el) => {
  const current = el.innerHTML;
  if (lastProcessed.get(el) === current) return;
  const transformed = stripLayerWrappers(current);
  lastProcessed.set(el, transformed);
  if (transformed !== current) {
    // eslint-disable-next-line no-param-reassign
    el.innerHTML = transformed;
  }
};

const hooked = new WeakSet();

const hook = (el) => {
  if (hooked.has(el)) return;
  hooked.add(el);
  normalize(el);
  const contentObserver = new MutationObserver(() => normalize(el));
  contentObserver.observe(el, { characterData: true, childList: true, subtree: true });
};

const attach = () => {
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    hook(existing);
    return;
  }

  const headObserver = new MutationObserver((mutations, observer) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.id === STYLE_ID) {
          hook(node);
          observer.disconnect();
          return;
        }
      }
    }
  });
  headObserver.observe(document.head, { childList: true });
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
}

# AGENTS.md
This file provides guidance to AI coding assistants working in this repository.

**Note:** CLAUDE.md, .clinerules, .cursorrules, .windsurfrules, .replit.md, GEMINI.md, AGENT.md, .github/copilot-instructions.md, and .idx/airules.md are copies of AGENTS.md in this project (symlinks not available on Windows without admin privileges).

---

## Detailed Instruction Files

For comprehensive guidelines with examples and checklists, refer to `.github/instructions/`:

| File | Scope | Use For |
|------|-------|---------|
| [vuejs3.instructions.md](.github/instructions/vuejs3.instructions.md) | `**/*.vue, **/*.ts, **/*.js` | Vue 3 patterns, Composition API, TypeScript, state management, routing |
| [code-review-generic.instructions.md](.github/instructions/code-review-generic.instructions.md) | `**` | Code quality, security review, testing standards, performance, architecture |
| [self-explanatory-code-commenting.instructions.md](.github/instructions/self-explanatory-code-commenting.instructions.md) | `**` | When/how to write comments, avoiding redundant comments |
| [reports-module.instructions.md](.github/instructions/reports-module.instructions.md) | `src/**/reports/**` | Reports module architecture |

---

## Project Overview

**Evocon** is a Vue 3-based manufacturing analytics and monitoring web application.

**Tech Stack:**
- **Framework:** Vue 3.5.26 (Composition API + Options API)
- **Build Tool:** Vite 7.2.1
- **UI Framework:** Vuetify 3.11.6
- **State Management:** Pinia 3.0.4
- **Testing:** Vitest 3.2.4 (7352+ tests)
- **Linting:** ESLint 9.39.1 (flat config)
- **Package Manager:** pnpm (NOT npm/yarn)

---

## Build & Commands

### Package Management - CRITICAL
**ALWAYS use `pnpm` commands, NOT npm directly.**

```bash
# Installation
pnpm install

# Development
pnpm run serve              # https://localhost.evocon.com:8080
pnpm run serve:live         # Production mode on port 8081

# Build
pnpm run build              # Production build
pnpm run build:live         # Production + ES6 check

# Testing & Linting
pnpm run test:unit          # All unit tests
pnpm run test:unit -- path/to/file.test.js  # Single file
pnpm run test:unit -- --grep "test name"    # By pattern
pnpm run lint               # ESLint

# Validation sequence (before commit)
pnpm run lint && pnpm run test:unit && pnpm run build:live
```

---

## Code Style

**Full details:** See [vuejs3.instructions.md](.github/instructions/vuejs3.instructions.md) and [code-review-generic.instructions.md](.github/instructions/code-review-generic.instructions.md)

### ESLint Enforced Rules
- **Indentation:** 2 spaces (strict)
- **Quotes:** Single quotes
- **Semicolons:** Required
- **Max line:** 200 characters
- **Variables:** `const`/`let` only (no `var`)
- **Prefer const:** Use `const` when variable is not reassigned
- **Arrow functions:** Required over function expressions
- **Console:** Only `console.warn` and `console.error`

### Naming Conventions
- **Components:** PascalCase (`EvoconVButton.vue`)
- **Files:** kebab-case (`date-helpers.js`)
- **Variables/Functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE
- **CSS Classes:** kebab-case
- **Vue Events:** kebab-case (`@update-value`)

### Magic Numbers
Avoid magic numbers except: `-1, 0, 1, 2, 3, 4, 5, 7, 10, 12, 24, 60, 100, 200, 300, 1000, 3600, 86400`

Use named constants for other values:
```javascript
const PREMIUM_THRESHOLD = 100;
const MAX_RETRY_ATTEMPTS = 5;
```

### Import Order (ESLint enforced)
```javascript
// 1. Builtin modules
import path from 'path';

// 2. External dependencies
import axios from 'axios';
import { ref, computed } from 'vue';

// 3. Internal (from src using @/)
import { formatDate } from '@/helpers/date';

// 4. Parent/Sibling/Index imports
import { helper } from './helper';
```

**Always use `@/` for src imports** - Never relative paths across major directories.

### Vue 3 Component Patterns

**New components:** Use Composition API with `<script setup>`
```vue
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  value: { type: String, required: true }
});

const emit = defineEmits(['update:value']);

const localValue = ref(props.value);
const displayValue = computed(() => localValue.value.toUpperCase());
</script>
```

**Existing components:** Options API still used (maintain compatibility)

**Component Structure:**
- Atomic design: atoms → molecules → organisms → pages → templates
- Components in their own folders with `index.vue`
- Max 3 attributes per line (single-line), 1 per line (multiline)

---

## Testing

**Full details:** See [code-review-generic.instructions.md](.github/instructions/code-review-generic.instructions.md)

### Framework & Configuration
- **Test Runner:** Vitest with jsdom environment
- **Utils:** @vue/test-utils 2.4.6
- **File Patterns:** `*.test.js` or `*.spec.js`
- **Setup File:** `vitest.setup.js`

### Coverage Thresholds
- Lines: 80% | Branches: 85% | Functions: 50% | Statements: 80%

### Testing Philosophy
**When tests fail, fix the code, not the test.**

- Tests should be meaningful - avoid tests that always pass
- Test actual functionality - call the functions being tested
- Failing tests are valuable - they reveal bugs
- Fix the root cause - don't hide or skip failing tests

### Test Structure
```javascript
describe('functionName', () => {
  it('describes expected behavior with clear action and result', () => {
    // Arrange
    const input = { name: 'test' };

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toStrictEqual({ processed: 'test' });
  });
});
```

### Global Mocks Available
- `$t` function (returns key as-is)
- `WorkerService`
- `ResizeObserver`
- `visualViewport`
- `window.matchMedia`

### Known Test Behaviors
- Vue warnings in stderr are normal (Vuetify stubbing)
- EditScrapDialog "window not defined" error is non-blocking

---

## Code Comments

**Full details:** See [self-explanatory-code-commenting.instructions.md](.github/instructions/self-explanatory-code-commenting.instructions.md)

**Write self-explanatory code - comment WHY, not WHAT.**

```javascript
// Bad: Obvious comment
const total = price * quantity; // Multiply price by quantity

// Good: Explains WHY
// GitHub API rate limit: 5000 requests/hour for authenticated users
await rateLimiter.wait();
```

**Comment these:**
- Complex business logic
- Non-obvious algorithm choices
- Regex patterns
- API constraints or gotchas
- TODOs/FIXMEs with context

---

## Directory Structure

```
src/
├── api/                    # API clients (*Api.js) - REST endpoints
├── assets/                 # Static assets
│   ├── animations/         # Lottie/animation files
│   ├── fonts/              # Custom fonts
│   ├── icons/              # SVG icons
│   └── images/             # Static images
├── components/             # Atomic design structure
│   ├── atoms/              # Basic UI elements (buttons, inputs)
│   ├── molecules/          # Composite components (form groups, cards)
│   ├── organisms/          # Complex features (tables, charts, dialogs)
│   ├── pages/              # Route-level views
│   └── templates/          # Layout wrappers
├── composables/            # Vue 3 composable functions (use*.js)
├── constants/              # Application constants
│   ├── alertsEmailConfigs/ # Alert email configuration
│   ├── productTourConfigs/ # Product tour steps
│   └── shiftviewDialogConfigs/
├── d3/                     # D3.js chart components
│   ├── AreaChart/          # Area chart visualization
│   ├── LineChart/          # Line chart visualization
│   ├── DotChart/           # Dot/scatter chart
│   ├── VerticalBarChart/   # Bar chart visualization
│   └── helpers/            # D3 utility functions
├── helpers/                # Utility functions by domain
│   ├── date/               # Date formatting/parsing
│   ├── time/               # Time calculations
│   ├── color/              # Color utilities
│   ├── numbers/            # Number formatting
│   ├── permissions/        # Permission checks
│   ├── validationRules/    # Form validation
│   └── ...                 # 30+ helper domains
├── plugins/                # Vue plugins (Vuetify, i18n)
├── router/                 # Vue Router config
├── services/               # Business logic services
│   ├── i18n/               # Internationalization
│   ├── indexedDB/          # Browser storage
│   └── WorkerService/      # Web worker management
├── stores/                 # Pinia stores (domain-specific)
├── styles/                 # Global SCSS/SASS
├── translationDocs/        # i18n documentation
└── workers/                # Web workers
```

---

## Known Issues & Workarounds

1. **Large bundle (8MB+):** Expected and optimized - do not attempt to fix
2. **Service Worker:** Excluded from ES6 check
3. **D3 Charts:** `LineChart.js` uses `.chunk()` with `line-workaround` class
4. **Timezone:** `weekOfYearToDate.js` format/parse workaround
5. **Global definition:** `global` in build, `globalThis` in serve

---

## Critical Reminders

- **Use pnpm exclusively** - Never npm directly
- **Don't fix bundle warnings** - 8MB+ is expected
- **Vue warnings in tests are normal** - Vuetify stubbing
- **2-space indentation** - ESLint enforced strictly
- **Always use @/ imports** - Never relative paths across directories
- **Test before commit** - lint → test → build
- **Atomic design structure** - Components in correct folders
- **Pinia for all state**

---

## Agent Delegation & Parallel Execution

### Always Delegate to Specialists

**When specialized agents are available, use them instead of attempting tasks yourself.**

#### Why Agent Delegation Matters
- Specialists have deeper, more focused knowledge
- They're aware of edge cases and subtle bugs
- They follow established patterns and best practices
- They can provide more comprehensive solutions

#### Key Principles
- **Check for specialists first** - Before starting a task, check if a specialized agent exists for that domain
- **Complex problems** - Delegate to domain experts; use diagnostic agents when scope is unclear
- **Multiple agents** - Send multiple Task tool calls in a single message to delegate in parallel

### When to Delegate

| Task Type | Delegate To | Why |
|-----------|-------------|-----|
| Vue component issues | Vue/frontend expert | Composition API patterns, Vuetify quirks |
| Test failures | Testing expert | Mocking, async patterns, coverage |
| TypeScript errors | TypeScript expert | Generics, conditional types |
| Build problems | Vite expert | HMR, chunking, plugins |
| ESLint issues | Linting expert | Rule interactions, auto-fixes |
| Performance | Performance expert | Profiling, optimization |
| Refactoring | Refactoring expert | Safe transformations |
| Git conflicts | Git expert | Merge strategies |
| Accessibility | Accessibility expert | WCAG, ARIA |
| CSS/styling | CSS expert | Layout, responsive design |

#### Project-Specific Specialists
- **Frontend:** Vue patterns, Vuetify, Pinia, Vue Router
- **Testing:** Vitest, Vue Test Utils, mocking strategies
- **Tooling:** Vite, ESLint, TypeScript/JSConfig

### Always Use Parallel Tool Calls

**When performing multiple operations, send all tool calls in a single message to execute them concurrently.**

#### These cases MUST use parallel tool calls
- Searching for different patterns (imports, usage, definitions)
- Multiple grep searches with different regex patterns
- Reading multiple files or searching different directories
- Combining Glob with Grep for comprehensive results
- Agent delegations with multiple Task calls to different specialists
- Any information gathering where you know upfront what you're looking for

#### Sequential calls ONLY when
You genuinely REQUIRE the output of one tool to determine the input of the next tool.

#### Planning Approach
1. Before making tool calls, think: "What information do I need to fully answer this question?"
2. Identify all searches/reads that can run independently
3. Send all tool calls in a single message to execute them in parallel
4. Most of the time, parallel tool calls can be used rather than sequential

**Performance Impact:** Parallel tool execution is 3-5x faster than sequential calls.

### Delegation Best Practices

1. **Be specific** - Include error messages, file paths, expected vs actual
2. **Provide context** - Vue 3, Vuetify, pnpm constraints
3. **State goal clearly** - "Fix the test" vs "Investigate why"
4. **Let specialists own it** - Don't micromanage

**Remember:** Both delegation and parallel execution are requirements, not suggestions.

---

## File References

- [src/main.js](src/main.js) - Entry point
- [src/App.vue](src/App.vue) - Root component
- [src/router/index.js](src/router/index.js) - Router config
- [vite.config.js](vite.config.js) - Vite config
- [eslint.config.js](eslint.config.js) - ESLint config
- [vitest.setup.js](vitest.setup.js) - Test setup
- [package.json](package.json) - Dependencies and scripts

---
**Last Updated:** January 2025

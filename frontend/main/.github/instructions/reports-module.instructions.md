---
description: 'Reports module architecture and development patterns for the reporting system'
applyTo: 'src/components/organisms/reports/**, src/components/pages/reports/**, src/stores/reportsConfig/**'
---

# Reports Module Development

Instructions for developing within the reports module - a complex reporting system with charts, tables, filters, and bookmarks.

## Module Overview

The reports module consists of three main areas:

| Area | Location | Purpose |
|------|----------|---------|
| Organisms | `src/components/organisms/reports/` | UI components (charts, tables, filters, dialogs) |
| Pages | `src/components/pages/reports/ReportsMain/` | Main page composition and layout |
| Store | `src/stores/reportsConfig/` | Pinia state management, API calls, data processing |

## Common Tasks - Where to Start

| Task | Entry Point |
|------|-------------|
| Modify chart behavior | `organisms/reports/ReportsChart/` |
| Change table columns | `stores/reportsConfig/configurations/tableColumns/` |
| Add/modify filters | `stores/reportsConfig/configurations/FilterBarConfig.js` |
| Change Y-axis options | `stores/reportsConfig/configurations/yAxisSelectionMenuItems.js` |
| Modify chart tooltips | `stores/reportsConfig/configurations/chartTooltipConfig/` |
| Add new measure/metric | `stores/reportsConfig/constants/measure.js` |
| Change data calculations | `stores/reportsConfig/maps/` |
| Modify bookmark presets | `stores/reportsConfig/configurations/bookmarkPresetDefaultsConfig.js` |

## Core Architecture

### Data Flow

**Component → Store → API → Data Mapper → Component**

1. **Components** dispatch store actions on user interaction
2. **Store actions** call API, cache responses, trigger data mapper
3. **Data mapper** (runs in Web Worker) transforms raw API data into chart/table formats
4. **Components** read transformed data via store getters and render

### Report Types (configType)

Each report type has its own configuration for measures, dimensions, filters, and UI options.

**Note**: `configType` values are UPPERCASE strings, while `granularity` values are lowercase:

| Type | Purpose | Primary Measures |
|------|---------|------------------|
| `DOWNTIME` | Stop/downtime analysis | Duration, count, percentage |
| `SPEEDLOSS` | Performance loss tracking | Duration, count, percentage |
| `SCRAPREASON` | Scrap analysis | Quantity, percentage |
| `OEE` | Overall Equipment Effectiveness | Availability, Performance, Quality, OEE |
| `QUANTITY` | Production quantities | Produced, good, scrap, ideal quantities |
| `TIME_USAGE` | Time allocation analysis | Duration by category |
| `CHECKLIST` | Checklist completion tracking | Completion rates |
| `CUSTOM_REPORT` | User-defined reports | Configurable |

### Key Store Subdirectories

| Directory | Purpose |
|-----------|---------|
| `stores/reportsConfig/constants/` | Type enums (configType, measure, dimension, granularity) |
| `stores/reportsConfig/configurations/` | Config objects (filters, table headers, tooltips) |
| `stores/reportsConfig/maps/` | Data transformation classes per report type |

## Key Architectural Concepts

### Store Architecture

The `reportsConfig` store module orchestrates all report functionality:

**State Categories:**
- **Raw Data**: API response stored as-is for reprocessing
- **Calculated Data**: Transformed data ready for rendering (chartData, tableData, totals)
- **UI State**: Loading flags, pagination, hidden legend items
- **Mapper Instance**: Holds the data mapper class for the current report type

**Getter Patterns:**
- Configuration getters derive UI options from current `configType`
- Request getters build API payloads from filter state
- Data getters provide formatted data for components

**Action Patterns:**
- `request*` actions handle API calls with caching
- `on*Change` actions respond to user interactions
- `initMapper*` actions trigger data transformation

### Granularity System

Reports support multiple time aggregation levels that affect both data fetching and display:

| Category | Granularities | Use Case |
|----------|---------------|----------|
| Micro | `starttime`, `duetime` | Individual events within a day |
| Daily | `date`, `dayofweek` | Day-level analysis |
| Weekly | `weekofyear` | Weekly trends |
| Monthly | `month`, `quarter` | Monthly/quarterly patterns |
| Yearly | `year` | Long-term trends |
| Aggregate | `total` | No time dimension, grouped by entities |

**Auto-selection**: Granularity auto-adjusts based on selected date range to show meaningful data points.

**Drill-down**: From `total` granularity, users can drill into time-based views while preserving filters.

### Filter System

Filters flow through the shared `filterbar` store module:

```
FilterBar Component → filterbar store → reportsConfig store → API Request
                                              ↓
                              URL query params (for sharing/bookmarks)
```

**Filter Types:**
- Entity filters (stations, products, operators)
- Time range (date picker)
- Report-specific filters (stop reasons, scrap reasons)
- Inverted filters (exclude selected items)

**Split Filters**: Large entity lists use paginated API calls to avoid performance issues.

### Bookmark System

Bookmarks save complete report configurations:

- **Presets**: System-defined report configurations per report type
- **User Bookmarks**: Custom saved configurations with filters, granularity, chart settings
- **URL State**: All filter state serializes to URL for sharing

Bookmarks are managed by the `bookmark` store module and displayed in `ReportsBookmarkDrawer`.

### Chart System

Charts use D3.js with a mixin-based class in `ReportsChart.js`. Supports column, line, area, and dot plot types with dual Y-axis and stacked grouping options.

## Key Patterns

### Related Store Modules

Reports components interact with these Pinia stores:
- `reportsConfig` - Primary module for report state and data
- `bookmark` - Saved report configurations
- `filterbar` - Shared filter state management
- `customReport` - User-defined report definitions

### Configuration-Driven Design

Report behavior is controlled by configuration objects, not hardcoded logic:

| Configuration | Purpose |
|---------------|---------|
| `requestMappingConfig` | Maps report type + granularity to API measures/dimensions |
| `tableHeadersConfig` | Defines table columns per report type |
| `FilterBarConfig` | Controls which filters appear for each report |
| `chartTooltipConfig/` | Templates for chart tooltip content |
| `yAxisSelectionMenuItems` | Available Y-axis metrics per report type |
| `groupByMenuItemsByConfigType` | Secondary grouping options |
| `bookmarkPresetDefaultsConfig` | Default filter values for preset bookmarks |

### Data Mapper Architecture

Data mappers transform raw API responses into chart/table-ready objects. They run in a Web Worker via `WorkerService`.

**Class hierarchy:**
```
DataMap (base)
  └── ReportsDataMap (adds x-axis labeling, grouping, granularity formatting)
        ├── OEEDataMap
        ├── QuantityDataMap
        ├── TimeUsageDataMap
        ├── CommentDataMap (downtime)
        ├── ScrapDataMap
        ├── PerformanceCommentDataMap (speedloss)
        ├── ChecklistsDataMap
        └── ProductionSpeedDataMap
```

**Three-stage pipeline** in each mapper:

| Stage | Property | Purpose |
|-------|----------|---------|
| 1. Key mapping | `keyMap` | Maps API field names → output property names. E.g., `['lotCode', 'lotcode']` reads API `lotcode`, writes `lotCode` |
| 2. Calculations | `calculationMap` | Derives computed values from raw data (e.g., OEE from availability × performance × quality) |
| 3. Formatting | `formatMap` | Converts values for display. `formatSetAsStr` handles Set→string, `formatPercentage` for %, etc. |

**`idKeyNameKeyMap`** — maps the raw API grouping field to the display name field:
```javascript
// key = API groupBy field, value = field containing the human-readable name
idKeyNameKeyMap = {
  stationId: 'station',      // API has both stationId (numeric) and station (name)
  productId: 'product',      // Same pattern: ID field → name field
  sku: 'sku',                // Self-labeling: the value IS the display name
  singleoperator: 'singleoperator',
  // ...
};
```

Used by `entityNameKey` getter → `xScaleValueLabelKey` getter → drives chart axis labels and `measureLabel`/`tooltipXLabel` in the keyMap.

### Data Grouping & Merging Pipeline

`processDataGranularity.js` orchestrates the full data processing flow:

```
API Response
  → ReportsDataPreprocessor (splits entries for OEE/Quantity/TimeUsage sub-groups)
  → remapObjKeys (copies display fields, e.g., sku → skulabel)
  → groupAndMergeEntries (multi-level hierarchical grouping)
  → formatGroupFn (runs DataMapper.getFormatted() per group)
  → { chartData, tableData, totals, stackLegend }
```

**Grouping levels** (from innermost to outermost):
1. Primary groupBy (e.g., `'stationId'`, `'lotcode'`) — from `getPrimaryGroupBy()`
2. Secondary groupBy — from `getSecondaryGroupBy()` (falls back to primary)
3. Highest-level groupBy — from `getHighestLevelGroupBy()` (e.g., `PREPROCESSED_GROUP_ID_KEY` for OEE sub-types)
4. Totals group key

**Merge behavior** (`mergeCustomizer`):
- **Primary keys** (groupBy fields): kept as-is, not merged
- **`convertToSetKeys`** fields (IDs like `stationId`, `productId`): merged into Sets
- **Numbers**: summed
- **Strings**: converted to Sets (for aggregated display via `formatSetAsStr`)

### Table Column Visibility & Ordering

`activeHeaders` getter in `reportsConfig/index.js` controls which table columns appear:

1. **Filtering**: columns pass if their `id` is in `reqDimensions` or `reqMeasures`, or is a calculated value
2. **Primary column reordering**: when granularity is `'total'`, the column whose `secondaryId` matches `groupBy[0]` is moved to position 0
3. **`isFirstIndex(index)`**: returns `true` at index 0, used for `isFixed` (pinned) and `isBold` styling

### Export Capabilities

| Format | Implementation |
|--------|----------------|
| PDF | Captures DOM elements (chart, table, filters) → generates PDF |
| Spreadsheet | Exports table data to XLSX via `onTableSpreadsheetExport` action |
| Notes Export | Separate export for attached notes/comments |

## Development Guidelines

### Adding New Report Types

1. Add constant to `constants/configType.js`
2. Configure request mapping in `configurations/requestMappingConfig.js`
3. Add filter configuration in `configurations/FilterBarConfig.js`
4. Create table headers in `configurations/tableColumns/`
5. Add tooltip configuration in `configurations/chartTooltipConfig/`
6. Add Y-axis options in `configurations/yAxisSelectionMenuItems.js`
7. Create data mapper if custom calculations needed

### Adding a New X-Axis Dimension (GroupBy Option)

Adding a new entity that users can group/pivot data by on the x-axis requires touching many config files. Missing any one causes subtle display bugs (blank labels, collapsed columns, broken tooltips).

**Constants & API layer:**
1. `constants/xAxisKey.ts` — add camelCase constant (e.g., `MY_KEY: 'myKey'`)
2. `constants/dimension.js` — add lowercase API dimension name (e.g., `MY_KEY: 'mykey'`)
3. `configurations/requestMappingConfig.js` — add `dimension.MY_KEY` to `getRequestDimensions()` for each relevant configType
4. `constants/queryParam.js` — add filter query param if it supports filtering

**GroupBy & data grouping:**
5. `configurations/groupByMenuItemsByConfigType.js` — add menu entry per configType with `requestGroupByArgs: [dimensionType.MY_KEY]`
6. `configurations/dataGroupingConfig.js` — add `[xAxisKey.MY_KEY]: 'mykey'` to BOTH `getPrimaryGroupBy()` and `getSecondaryGroupBy()` `commonGroupKeysMap`

**Data mappers (repeat for each relevant DataMap subclass):**
7. `maps/*DataMap.js` `keyMap` — add `['myKey', 'mykey']` to map API field → camelCase output
8. `maps/*DataMap.js` `formatMap` — add `['myKey', formatSetAsStr]` for Set→string display
9. `maps/*DataMap.js` `idKeyNameKeyMap` — add `mykey: 'mykey'` (maps groupBy field → display name field)
10. `maps/ReportsDataMap.js` `idKeyNameKeyMap` — same as above (base class)

**Table columns:**
11. `configurations/tableColumns/commonColumns.js` — add column with `textKey`, `id: dimension.MY_KEY`, `secondaryId: xAxisKey.MY_KEY`
12. `configurations/tableHeadersConfig.js` — add `commonColumn.MY_KEY` to each relevant configType array

**Chart labels & tooltips:**
13. `configurations/labelsByChartTypeAndGrouping.js` — add `myKey: { text: i18n.global.t('...') }` to `commonColumns` in `getEntityLabelMap()`
14. `configurations/chartTooltipConfig/helpers/groupingHelpers.ts` — add `[xAxisKey.MY_KEY, buildSubGroupTooltipConfig(xAxisKey.MY_KEY, 'myKey')]` to `groupByMap`

**Filters (if dimension supports filtering):**
15. `configurations/FilterBarConfig.js` — add filter control configuration

Steps 13-14 are the most commonly missed — without them, charts show blank axis labels and collapse all data into a single column.

### Adding New Measures

When adding new measures or Y-axis metrics:

1. Add constant to `constants/measure.js`
2. Update `requestMappingConfig` to include in API requests
3. Add table column in relevant `tableColumns/` config
4. Add Y-axis option in `configurations/yAxisSelectionMenuItems.js` if chartable
5. Update tooltip config in `configurations/chartTooltipConfig/` for chart hover display

### Performance Considerations

- **Datapoint Limit**: System warns users when data exceeds recommended limits
- **Web Workers**: Heavy data processing runs off-main-thread via `WorkerService`
- **Request Caching**: API responses cached in IndexedDB (`RequestCache`)
- **Debouncing**: Chart rendering debounced to prevent excessive redraws
- **Lazy Rendering**: Charts initialize after container is measured

### Reports-Specific Pitfalls

- **Don't hardcode report-specific logic in components** - use configuration files instead
- **Don't skip the data mapper layer** - raw API data should never reach components directly.
- **Don't forget URL state** - filter changes must reflect in URL for bookmark/sharing functionality
- **Don't ignore the loading stack** - use `dataLoading` array for concurrent request tracking

// source: https://codepen.io/crwilson311/pen/Bajbdwd

function createDiv(height) {
  const div = document.createElement('div');
  div.style.top = 0;
  div.style.right = 0;
  div.style.width = '5px';
  div.style.position = 'absolute';
  div.style.cursor = 'col-resize';
  div.style.userSelect = 'none';
  div.style.height = `${height}px`;
  div.className = 'column-drag-handle';
  return div;
}

function getStyleVal(elm, css) {
  return (window.getComputedStyle(elm, null).getPropertyValue(css));
}

function paddingDiff(col) {
  if (getStyleVal(col, 'box-sizing') === 'border-box') {
    return 0;
  }

  const padLeft = getStyleVal(col, 'padding-left');
  const padRight = getStyleVal(col, 'padding-right');
  return (parseInt(padLeft, 10) + parseInt(padRight, 10));
}

function getElementIndex(element) {
  return Array.from(element.parentNode.children).indexOf(element);
}
export default class ResizeableGrid {
  constructor(table) {
    this.pageX = null;
    this.curCol = null;
    this.curColWidth = null;
    this.curColIndex = null;
    this.table = table;
    this.rows = null;
  }

  onMouseMove(event) {
    if (this.curCol) {
      const diffX = event.pageX - this.pageX;
      // eslint-disable-next-line no-magic-numbers
      const minColWidth = Array.from(this.curCol.classList).includes('numeric-header') ? 40 : 80;
      const maxColWidth = 1000;
      const curColNewWidth = Math.min(Math.max(this.curColWidth + diffX, minColWidth), maxColWidth);

      if (this.rows.length) {
        for (let i = 0; i < this.rows.length; i += 1) {
          const currentRowColumns = this.rows[i].children;
          currentRowColumns[this.curColIndex].style.width = `${curColNewWidth}px`;
          currentRowColumns[this.curColIndex].style.minWidth = `${curColNewWidth}px`;
          currentRowColumns[this.curColIndex].style.maxWidth = `${curColNewWidth}px`;
        }
      }
    }
  }

  onMouseDown(event) {
    this.curCol = event.target.parentElement;
    this.curCol.style.pointerEvents = 'none';
    this.pageX = event.pageX;
    this.curColIndex = getElementIndex(this.curCol);
    this.rows = Array.from(this.table.getElementsByTagName('tr'));
    const padding = paddingDiff(this.curCol);

    this.curColWidth = this.curCol.offsetWidth - padding;

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseUp() {
    if (this.curCol) this.curCol.style.pointerEvents = 'auto';
    this.curCol = undefined;
    this.pageX = undefined;
    this.curColWidth = undefined;
    this.curColIndex = undefined;
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  setListeners(div) {
    div.addEventListener('mousedown', this.onMouseDown.bind(this));

    div.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
    });

    div.addEventListener('mouseover', (e) => {
      e.target.style.borderRight = '1px solid #101010';
    });

    div.addEventListener('mouseout', (e) => {
      e.target.style.borderRight = '';
    });

    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  updateColumnHandles() {
    const actualTable = this.table.getElementsByTagName('table')[0];
    const tableHeight = actualTable?.offsetHeight ?? 0;
    const row = actualTable?.getElementsByTagName('tr')[0];
    const cols = row ? row.children : undefined;
    const fixedCols = this.table.querySelectorAll('.fixed-column');
    const lastFixedCol = fixedCols.length > 0 ? fixedCols[fixedCols.length - 1] : null;
    const lastFixedColRight = lastFixedCol ? lastFixedCol.getBoundingClientRect().right : null;

    if (!cols) return;

    for (let i = 0; i < cols.length; i += 1) {
      const col = cols[i];
      const handle = col.querySelector('.column-drag-handle');
      const isFixedColumn = col.classList.contains('fixed-column');
      const handleLeftEdge = col.getBoundingClientRect().right - 5;
      const handleShouldBeVisible = isFixedColumn || lastFixedColRight === null || handleLeftEdge >= lastFixedColRight;

      if (handle) {
        handle.style.display = 'block';
        handle.style.height = `${tableHeight}px`;
        if (handleShouldBeVisible) {
          handle.style['pointer-events'] = 'auto';
          handle.style.visibility = 'visible';
        } else {
          handle.style['pointer-events'] = 'none';
          handle.style.visibility = 'hidden';
        }
      }
    }
  }

  init() {
    const actualTable = this.table?.getElementsByTagName('table')[0];
    const tableHeight = actualTable?.offsetHeight ?? 0;
    const row = actualTable?.getElementsByTagName('tr')[0];
    const cols = row ? row.children : undefined;

    if (cols) {
      this.table.style.overflow = 'hidden';

      for (let i = 0; i < cols.length; i += 1) {
        if (!Array.from(cols[i].classList).includes('is-numeric')) {
          const hasHandle = cols[i].querySelector('.column-drag-handle');
          if (hasHandle) return;
          const div = createDiv(tableHeight);
          cols[i].appendChild(div);
          this.setListeners(div);
        }
      }
    }

    this.updateColumnHandles();
  }
}

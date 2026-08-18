import ResizeableGrid from './resizeableGrid';

const createTableWithCols = (colCount, fixedColIndex = null) => {
  const tableWrapper = document.createElement('div');
  const table = document.createElement('table');
  const tr = document.createElement('tr');
  for (let i = 0; i < colCount; i += 1) {
    const td = document.createElement('td');
    if (i === fixedColIndex) td.classList.add('fixed-column');
    tr.appendChild(td);
  }
  table.appendChild(tr);
  tableWrapper.appendChild(table);
  return tableWrapper;
};

describe('ResizeableGrid updateColumnHandles', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('sets pointer events and visibility to none/hidden if handle is behind the fixed column', () => {
    const table = createTableWithCols(3, 0);
    document.body.appendChild(table);
    const grid = new ResizeableGrid(table);
    grid.init();

    const col1 = table.querySelector('tr').children[1];
    Object.defineProperty(col1, 'getBoundingClientRect', { value: () => ({ right: 10 }) });
    const fixedCol = table.querySelector('.fixed-column');
    Object.defineProperty(fixedCol, 'getBoundingClientRect', { value: () => ({ right: 50 }) });

    grid.updateColumnHandles();

    const handle = col1.querySelector('.column-drag-handle');
    expect(handle.style.pointerEvents).toBe('none');
    expect(handle.style.visibility).toBe('hidden');
  });

  it('sets pointer events and visibility to auto/visible if handle is not behind the fixed column', () => {
    const table = createTableWithCols(3, 0);
    document.body.appendChild(table);
    const grid = new ResizeableGrid(table);
    grid.init();

    const col1 = table.querySelector('tr').children[1];
    Object.defineProperty(col1, 'getBoundingClientRect', { value: () => ({ right: 100 }) });
    const fixedCol = table.querySelector('.fixed-column');
    Object.defineProperty(fixedCol, 'getBoundingClientRect', { value: () => ({ right: 50 }) });

    grid.updateColumnHandles();

    const handle = col1.querySelector('.column-drag-handle');
    expect(handle.style.pointerEvents).toBe('auto');
    expect(handle.style.visibility).toBe('visible');
  });

  it('prevents click event propagation from drag handles', () => {
    const table = createTableWithCols(2);
    document.body.appendChild(table);
    const grid = new ResizeableGrid(table);
    grid.init();

    const col = table.querySelector('tr').children[0];
    const handle = col.querySelector('.column-drag-handle');
    const clickSpy = vi.fn();
    col.addEventListener('click', clickSpy);

    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

    handle.dispatchEvent(clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });
});

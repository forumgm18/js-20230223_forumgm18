export default class SortableTable {
  subElements = {};
  constructor(headersConfig, { 
    data = [], 
    sorted = {
      id: headersConfig.find(item => item.sortable).id, 
      order: 'desc'
    }, 
    isSortLocally = true 
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = [...data];
    this.sorted = {...sorted};
    this.isSortLocally = isSortLocally;
    this.render();
    this.addListeners();
  }
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="sortable-table">
          ${this.getTableHeader()}
          <div data-element="body" class="sortable-table__body"></div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>  
    `;
     this.element = wrapper.firstElementChild; 
     this.getSubElements();
     this.sort(this.sorted.id, this.sorted.order)

  }
  getSubElements(){
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }
  addListeners() {
    this.subElements.header.addEventListener('pointerdown', e => {
      const cell = e.target.closest('[data-sortable="true"]');
      if (cell) {
        const id = cell.dataset.id;
        let order;  
        switch(cell.dataset.order) {
          case 'asc': 
            order = 'desc';
            break;
          case 'desc': 
            order = 'asc';
            break;
          default: 
            order = 'desc';
        }
        this.sort(id, order);
      }
    });
      
  }
  getTableHeader() {
    const headCells = this.headerConfig.map(el => this.getHeaderCell(el));
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headCells.join('')}
      </div>
    `
  }
  getHeaderCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `
  }

  getTableBodyRow(el) {
    const rowArr = this.headerConfig.map(itm => this.getTableBodyRowCell(el, itm));
    return `
      <a href="/products/${el.id}" class="sortable-table__row">
        ${rowArr.join('')}
      </a>
    `
  }

  getTableBodyRowCell(curDataRow, { id, template }) {
    return template ? template(curDataRow[id]) : `<div class="sortable-table__cell">${curDataRow[id]}</div>` 
  }

  getTableBody(data) {
    return data
      .map(el => this.getTableBodyRow(el))
      .join('')
  }

  sort(field, order){
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }
  sortOnClient(field, order){
    const headerOrderedFiled = this.subElements.header.querySelector(`[data-id="${field}"]`);
    this.subElements.header
      .querySelectorAll('[data-order]')
      .forEach(el => el.dataset.order = '');
    if (headerOrderedFiled) headerOrderedFiled.dataset.order = order; 
    this.subElements.body.innerHTML = this.getTableBody(this.dataSort(field, order));
  }
  dataSort(field, order = 'asc'){
    const 
      arr = [...this.data],
      {sortType} = this.headerConfig.find(el => el.id === field),
      directions = {
         asc:  1, 
        desc: -1
      },
      direction = directions[order]
    ;

      switch(sortType) {
        case 'number' :
          return arr.sort( (a, b) => direction * (a[field] - b[field]) );
        case 'string': 
          return arr.sort( (a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en']) )
        default: 
          throw new Error(`Неизвестный тип ${sortType}`);  
      }
  }

  remove() {
    if (this.element) this.element.remove()
  }
  destroy() {
    this.remove();
    this.subElements = {}
  }
}


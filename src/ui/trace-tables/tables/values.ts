/**
 * Values Table Module - Variable values matrix table
 *
 * This module provides a dynamic table for tracking variable values
 * across different execution steps. Supports adding/removing rows and columns.
 */

export const style = `
<style>
  table,
  th,
  td {
    border: 1px solid black;
  }
  th {
    background-color: white;
  }
  table {
    border-collapse: collapse;
  }
  .line-number {
    width: 3em;
  }
  .varname-header {
    text-align: center;
    width: 10em;
    font-weight: bold;
  }
  .standard-column {
    width: 10em;
    text-align: center;
  }
  .side-by-side {
    display: flex;
    flex-direction: row;
  }
  #close-button {
    float: left;
  }
</style>`;

export const table = `
<div>
  <div class='side-by-side'>
    <table id="standard-table" class="standard-table">
      <tbody id="table-body">
        <tr>
          <th><button id='close-button'>X</button></th>
        </tr>
      </tbody>
    </table>
    <div>
      <button id="remove-column">-</button>
      <button id="add-column">+</button>
    </div>
  </div>
  <button id="add-row">+</button>
  <button id="remove-row">-</button>
</div>`;

/**
 * Initializes the values table with dynamic row/column management
 * @param shadow - The shadow root containing the table
 */
export const init = (shadow: ShadowRoot): void => {
	const tableBody = shadow.getElementById(
		'table-body'
	) as HTMLTableSectionElement;
	if (!tableBody) {
		console.warn('Values table: table-body element not found');
		return;
	}

	// Internal state for tracking dimensions
	interface TableState {
		rows: number;
		columns: number;
	}

	const tableState: TableState = {
		rows: 0,
		columns: 0,
	};

	// Element creation functions
	const createVariableHeader = (): HTMLTableHeaderCellElement => {
		const th = document.createElement('th');
		th.innerHTML = `<input class="varname-header" placeholder='variable name' />`;
		return th;
	};

	const createLineNumberRow = (): HTMLTableRowElement => {
		const tr = document.createElement('tr');
		const lineNumberTd =
			'<td><input class="line-number" type="number" min="1" /></td>';
		const valueCells = new Array(tableState.columns)
			.fill("<td><input class='standard-column' /></td>")
			.join('');

		tr.innerHTML = lineNumberTd + valueCells;
		return tr;
	};

	const createValueCell = (): HTMLTableDataCellElement => {
		const td = document.createElement('td');
		td.innerHTML = "<input class='standard-column' />";
		return td;
	};

	// Event handlers
	const addRow = (): void => {
		tableBody.appendChild(createLineNumberRow());
		tableState.rows++;
	};

	const removeRow = (): void => {
		if (tableBody.childElementCount <= 1) {
			return; // Keep at least the header row
		}
		const lastChild = tableBody.lastChild;
		if (lastChild) {
			tableBody.removeChild(lastChild);
			tableState.rows--;
		}
	};

	const addColumn = (): void => {
		const tableBodyChildren = Array.from(
			tableBody.children
		) as HTMLTableRowElement[];

		// Add header to first row
		if (tableBodyChildren.length > 0) {
			tableBodyChildren[0].appendChild(createVariableHeader());
		}

		// Add value cell to all other rows
		for (let i = 1; i < tableBodyChildren.length; i++) {
			tableBodyChildren[i].appendChild(createValueCell());
		}

		tableState.columns++;
	};

	const removeColumn = (): void => {
		if (
			tableBody.children[0] &&
			(tableBody.children[0] as HTMLTableRowElement).childElementCount <=
				1
		) {
			return; // Keep at least the close button column
		}

		const tableBodyChildren = Array.from(
			tableBody.children
		) as HTMLTableRowElement[];
		for (const row of tableBodyChildren) {
			const lastChild = row.lastChild;
			if (lastChild) {
				row.removeChild(lastChild);
			}
		}

		tableState.columns--;
	};

	// Set up event listeners
	const addRowButton = shadow.getElementById('add-row');
	const removeRowButton = shadow.getElementById('remove-row');
	const addColumnButton = shadow.getElementById('add-column');
	const removeColumnButton = shadow.getElementById('remove-column');

	if (addRowButton) {
		addRowButton.addEventListener('click', addRow);
	}

	if (removeRowButton) {
		removeRowButton.addEventListener('click', removeRow);
	}

	if (addColumnButton) {
		addColumnButton.addEventListener('click', addColumn);
	}

	if (removeColumnButton) {
		removeColumnButton.addEventListener('click', removeColumn);
	}

	// Initialize with one row and one column
	addRow();
	addColumn();
};

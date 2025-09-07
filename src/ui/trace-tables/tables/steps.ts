/**
 * Steps Table Module - Variable step tracking table
 *
 * This module provides a table for tracking variable operations step by step,
 * including line numbers, variable names, actions, and values.
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
  .value-input {
    width: 13em;
  }
  .name-input {
    width: 7em;
  }
  #close-button {
    float: left;
  }
</style>`;

export const table = `
<div>
  <table>
    <tbody id="table-body">
      <tr>
        <th><button id='close-button'>X</button></th>
        <th>line</th>
        <th>name</th>
        <th>action</th>
        <th>value</th>
      </tr>
    </tbody>
  </table>

  <button id="add-row">+</button>
  <button id="remove-row">-</button>
</div>`;

/**
 * Initializes the steps table with event handlers and default content
 * @param shadow - The shadow root containing the table
 */
export const init = (shadow: ShadowRoot): void => {
	const tableBody = shadow.getElementById(
		'table-body'
	) as HTMLTableSectionElement;
	if (!tableBody) {
		console.warn('Steps table: table-body element not found');
		return;
	}

	const rowTemplate = `
    <td><input type="radio" name="step" checked /></td>
    <td><input class="line-number" type="number" min="1" /></td>
    <td><input class='name-input' /></td>
    <td>
      <select>
        <option></option>
        <option>declare</option>
        <option>declare, init</option>
        <option>read</option>
        <option>assign</option>
      </select>
    </td>
    <td><input class='value-input' /></td>
  `;

	/**
	 * Adds a new row to the table
	 */
	const addRow = (): void => {
		const tr = document.createElement('tr');
		tr.innerHTML = rowTemplate;
		tableBody.appendChild(tr);
	};

	/**
	 * Removes the last row from the table (unless it's the header)
	 */
	const removeRow = (): void => {
		if (tableBody.childElementCount <= 1) {
			return; // Keep at least the header row
		}
		const lastChild = tableBody.lastChild;
		if (lastChild) {
			tableBody.removeChild(lastChild);
		}
	};

	// Set up event listeners
	const addButton = shadow.getElementById('add-row');
	const removeButton = shadow.getElementById('remove-row');

	if (addButton) {
		addButton.addEventListener('click', addRow);
	}

	if (removeButton) {
		removeButton.addEventListener('click', removeRow);
	}

	// Initialize with one row
	addRow();
};

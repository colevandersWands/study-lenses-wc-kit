/**
 * Operators Table Module - Operator evaluation tracking table
 *
 * This module provides a table for tracking operator evaluations step by step.
 * Supports different operator types:
 * - Unary prefix: op | value -> evaluates to
 * - Unary postfix: value | op -> evaluates to
 * - Binary: value | op | value -> evaluates to
 * - Ternary: value ? value : value -> evaluates to
 */

export const style = `
<style>
  table,
  th,
  td {
    border: 1px solid black;
    white-space: nowrap;
    overflow-x: auto;
  }
  th {
    background-color: white;
  }
  table {
    border-collapse: collapse;
  }
  input {
    display: inline-block;
    text-align: center;
  }
  .value {
    width: 5em;
  }
  .operator {
    width: 3em;
  }
  .line-number {
    width: 3em;
  }
  .value-input {
    width: 13em;
  }
  #close-button {
    float: left;
  }
</style>`;

export const table = `
<div style='background-color: white;'>
  <table>
    <tbody id="table-body">
      <tr>
        <th><button id='close-button'>X</button></th>
        <th>expression</th>
        <th>evaluates to</th>
      </tr>
    </tbody>
  </table>

  add step:
  <button id="unaryPre">unary prefix</button>
  <button id="unaryPost">unary postfix</button>
  <button id="binary">binary</button>
  <!-- <button id="shortCircuit">short-circuit</button> -->
  <button id="ternary">ternary</button>
  || <button id="remove-row">remove step</button>
</div>`;

/**
 * Row type identifiers for operator table
 */
type RowType = 'unaryPre' | 'unaryPost' | 'binary' | 'ternary' | 'shortCircuit';

/**
 * Initializes the operators table with different row types and event handlers
 * @param shadow - The shadow root containing the table
 */
export const init = (shadow: ShadowRoot): void => {
	const tableBody = shadow.getElementById(
		'table-body'
	) as HTMLTableSectionElement;
	if (!tableBody) {
		console.warn('Operators table: table-body element not found');
		return;
	}

	let stepCounter = 1;

	// Row template generators for different operator types
	const rowTemplates: Record<RowType, () => string> = {
		unaryPre: () => `
      <td><text>${stepCounter}. </text></td>
      <td>
        <input placeholder='op' class='operator' />
        <input placeholder='value' class='value' />
      </td>
      <td><input class='value-input' /></td>
    `,
		unaryPost: () => `
      <td><text>${stepCounter}. </text></td>
      <td>
        <input placeholder='value' class='value' />
        <input placeholder='op' class='operator' />
      </td>
      <td><input class='value-input' /></td>
    `,
		binary: () => `
      <td><text>${stepCounter}. </text></td>
      <td>
        <input placeholder='value 1' class='value' />
        <input placeholder='op' style='width: 2em;' class='operator' />
        <input placeholder='value 2' class='value' />
      </td>
      <td><input class='value-input' /></td>
    `,
		ternary: () => `
      <td><text>${stepCounter}. </text></td>
      <td>
        <input placeholder='value 1' class='value' /> ?
        <input placeholder='value 2' class='value' /> :
        <input placeholder='value 3' class='value' />
      </td>
      <td><input class='value-input' /></td>
    `,
		shortCircuit: () => `
      <td><text>${stepCounter}. </text></td>
      <td>
        <input placeholder='value 1' class='value' />
        <input placeholder='op' class='operator' />
        <input placeholder='(right side)' class='value' readonly />
      </td>
      <td><input class='value-input' /></td>
    `,
	};

	/**
	 * Adds a new row of the specified type
	 * @param event - The click event from the button
	 */
	const addRow = (event: Event): void => {
		const target = event.target as HTMLButtonElement;
		const rowType = target.id as RowType;

		if (!rowTemplates[rowType]) {
			console.warn('Operators table: unknown row type', rowType);
			return;
		}

		const tr = document.createElement('tr');
		tr.innerHTML = rowTemplates[rowType]();
		tableBody.appendChild(tr);
		stepCounter++;
	};

	/**
	 * Removes the last row from the table
	 */
	const removeRow = (): void => {
		if (tableBody.childElementCount <= 1) {
			return; // Keep at least the header row
		}

		const lastChild = tableBody.lastChild;
		if (lastChild) {
			tableBody.removeChild(lastChild);
			stepCounter = Math.max(1, stepCounter - 1);
		}
	};

	// Set up event listeners for all operator type buttons
	const buttonIds: RowType[] = ['unaryPre', 'unaryPost', 'binary', 'ternary'];

	for (const buttonId of buttonIds) {
		const button = shadow.getElementById(buttonId);
		if (button) {
			button.addEventListener('click', addRow);
		}
	}

	// Set up remove button
	const removeButton = shadow.getElementById('remove-row');
	if (removeButton) {
		removeButton.addEventListener('click', removeRow);
	}

	// Note: shortCircuit button is commented out in HTML but template exists for future use
};

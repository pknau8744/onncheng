// script.js

// ====== Inventory ======
async function addInventoryItem() {
  const item = {
    item: document.getElementById('invItem').value,
    desc: document.getElementById('invDesc').value,
    qty: Number(document.getElementById('invQty').value),
    clientName: document.getElementById('invClientName').value,
    clientMobile: document.getElementById('invClientMobile').value,
    vehicleModel: document.getElementById('invVehicleModel').value,
    vehicleNumber: document.getElementById('invVehicleNumber').value,
    date: document.getElementById('invDate').value
  };

  const res = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });

  const data = await res.json();
  if (data.success) {
    alert('Inventory item saved');
    fetchInventory();
  }
}

async function fetchInventory() {
  const res = await fetch('/api/inventory');
  const data = await res.json();

  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = '';

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.item}</td>
        <td>${item.desc}</td>
        <td>${item.qty}</td>
        <td>${item.clientName}</td>
        <td>${item.clientMobile}</td>
        <td>${item.vehicleModel}</td>
        <td>${item.vehicleNumber}</td>
        <td>${item.date}</td>
      </tr>
    `;
  });
}


// ====== Billing ======
let billingItems = [];
function addBillItem() {
  const item = {
    item: document.getElementById('itemName').value,
    qty: Number(document.getElementById('itemQty').value),
    price: Number(document.getElementById('itemPrice').value),
    date: document.getElementById('itemDate').value,
    vehicleModel: document.getElementById('itemModel').value,
    vehicleNumber: document.getElementById('itemNumber').value,
    clientName: document.getElementById('itemClientName').value,
    clientMobile: document.getElementById('itemClientMobile').value
  };

  // ✅ Auto-set customer name from client name
  document.getElementById('customerName').value = item.clientName;

  // ✅ Push item into bill list
  billingItems.push(item);
  renderBillingTable();

  // ✅ Update bill summary table & preview
  updateBillMetaTableAndPreview(item);
}





function renderBillingTable() {
  const tbody = document.getElementById('billingTableBody');
  tbody.innerHTML = '';
  billingItems.forEach((item, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${item.item}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${item.date}</td>
        <td>${item.vehicleModel}</td>
        <td>${item.vehicleNumber}</td>
        <td>${item.clientName}</td>
        <td>${item.clientMobile}</td>
        <td>
          <button onclick="editBillItem('${item._id || index}')">Edit</button>
          <button onclick="deleteBillItem('${item._id || index}')">Delete</button>
        </td>
      </tr>
    `;
  });
}


function deleteBillItem(index) {
  billingItems.splice(index, 1); // remove from array
  renderBillingTable(); // re-render table
}

function editBillItem(index) {
  const item = billingItems[index];

  // Set item values back into the form
  document.getElementById('itemName').value = item.item;
  document.getElementById('itemQty').value = item.qty;
  document.getElementById('itemPrice').value = item.price;

  // You can also update these if needed:
  // document.getElementById('billDate').value = item.date;
  // document.getElementById('vehicleModel').value = item.vehicleModel;
  // document.getElementById('vehicleNumber').value = item.vehicleNumber;
  // document.getElementById('clientName').value = item.clientName;
  // document.getElementById('clientMobile').value = item.clientMobile;

  // Remove from array temporarily
  billingItems.splice(index, 1);
  renderBillingTable();
}


async function saveBill() {
  for (const item of billingItems) {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });

    const data = await res.json();
    if (!data.success) {
      alert('Error saving bill item');
      return;
    }
  }
  alert('All bill items saved');
  billingItems = [];
  renderBillingTable();
  fetchBilling();
}

async function fetchBilling() {
  const res = await fetch('/api/billing');
  const data = await res.json();

  const tbody = document.getElementById('billingTableBody');
  tbody.innerHTML = '';

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.item}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${item.date}</td>
        <td>${item.vehicleModel}</td>
        <td>${item.vehicleNumber}</td>
        <td>${item.clientName}</td>
        <td>${item.clientMobile}</td>
      </tr>
    `;
  });
}

// ====== Utility Buttons ======
function printBill() {
  window.print();
}

function exportBillToExcel() {
  const wb = XLSX.utils.book_new();
  const table = document.querySelector('table');
  const ws = XLSX.utils.table_to_sheet(table);
  XLSX.utils.book_append_sheet(wb, ws, 'Bills');
  XLSX.writeFile(wb, 'billing_data.xlsx');
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
  fetchBilling();
});

async function exportBillToExcel() {
  // Fetch saved bill items from the server
  const res = await fetch('/api/billing');
  const data = await res.json();

  // Convert to worksheet
  const wsData = [
    ['Item', 'Quantity', 'Price', 'Date', 'Vehicle Model', 'Vehicle Number', 'Client Name', 'Client Mobile']
  ];

  data.forEach(item => {
    wsData.push([
      item.item,
      item.qty,
      item.price,
      item.date,
      item.vehicleModel,
      item.vehicleNumber,
      item.clientName,
      item.clientMobile
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bills');
  XLSX.writeFile(wb, 'billing_data.xlsx');
}

async function exportInventoryToExcel() {
  // Fetch inventory data from server
  const res = await fetch('/api/inventory');
  const data = await res.json();

  // Convert to worksheet data array
  const wsData = [
    ['Item', 'Description', 'Quantity', 'Client Name', 'Client Mobile', 'Vehicle Model', 'Vehicle Number', 'Date']
  ];

  data.forEach(item => {
    wsData.push([
      item.item,
      item.desc,
      item.qty,
      item.clientName,
      item.clientMobile,
      item.vehicleModel,
      item.vehicleNumber,
      item.date
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  XLSX.writeFile(wb, 'inventory_data.xlsx');
}

function updateBillMeta() {
  const date = document.getElementById('billDate').value;
  const model = document.getElementById('vehicleModel').value;
  const number = document.getElementById('vehicleNumber').value;
  const name = document.getElementById('clientName').value;
  const mobile = document.getElementById('clientMobile').value;

  // Set in top billing details table
  document.getElementById('tdDate').textContent = date;
  document.getElementById('tdVehicleModel').textContent = model;
  document.getElementById('tdVehicleNumber').textContent = number;
  document.getElementById('tdClientName').textContent = name;
  document.getElementById('tdClientMobile').textContent = mobile;

  // Set in bill-preview
  document.getElementById('prevDate').textContent = date;
  document.getElementById('prevVehicleModel').textContent = model;
  document.getElementById('prevVehicleNumber').textContent = number;
  document.getElementById('prevClientName').textContent = name;
  document.getElementById('prevClientMobile').textContent = mobile;

  // Set in billing form fields
  document.getElementById('itemDate').value = date;
  document.getElementById('itemModel').value = model;
  document.getElementById('itemNumber').value = number;
  document.getElementById('itemClientName').value = name;
  document.getElementById('itemClientMobile').value = mobile;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
  fetchBilling();

  // Add input event listeners to update automatically
  ['billDate', 'vehicleModel', 'vehicleNumber', 'clientName', 'clientMobile'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateBillMeta);
  });
});

function updateBillMetaTableAndPreview(item) {
  document.getElementById('tdDate').textContent = item.date;
  document.getElementById('tdVehicleModel').textContent = item.vehicleModel;
  document.getElementById('tdVehicleNumber').textContent = item.vehicleNumber;
  document.getElementById('tdClientName').textContent = item.clientName;
  document.getElementById('tdClientMobile').textContent = item.clientMobile;
  document.getElementById('tdPrice').textContent = item.price; // ✅

  document.getElementById('prevDate').textContent = item.date;
  document.getElementById('prevVehicleModel').textContent = item.vehicleModel;
  document.getElementById('prevVehicleNumber').textContent = item.vehicleNumber;
  document.getElementById('prevClientName').textContent = item.clientName;
  document.getElementById('prevClientMobile').textContent = item.clientMobile;
  document.getElementById('prevPrice').textContent = item.price; // ✅
  document.getElementById('prevPrice').textContent = item.price;

}
let previewItems = [];
let totalPreviewPrice = 0;

function itempreviu() {
  const addItemBtn = document.getElementById('additem');

  addItemBtn.addEventListener('click', () => {
    const item = document.getElementById('billitem').value;
    const quantity = document.getElementById('partquntayti').value;
    const price = parseFloat(document.getElementById('price').value);

    if (!item || !quantity || isNaN(price)) {
      alert("Please enter all fields correctly!");
      return;
    }

    const itemObj = { item, quantity, price };
    previewItems.push(itemObj); // ✅ Store for export/save

    // Add row in preview
    const tbody = document.getElementById('itemPreviewBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${item}</td>
      <td>${quantity}</td>
      <td>${price}</td>
    `;
    tbody.appendChild(newRow);

    // Update total
    totalPreviewPrice += price;
    document.getElementById('tdPrice').textContent = totalPreviewPrice.toFixed(2);
    document.getElementById('prevPrice').textContent = totalPreviewPrice.toFixed(2);

    // Clear
    document.getElementById('billitem').value = '';
    document.getElementById('partquntayti').value = '';
    document.getElementById('price').value = '';
  });
}
itempreviu();

function finalizeBill() {
  if (previewItems.length === 0) {
    alert("No items to save.");
    return;
  }

  // Get client details
  const clientDetails = {
    date: document.getElementById('prevDate').textContent,
    vehicleModel: document.getElementById('prevVehicleModel').textContent,
    vehicleNumber: document.getElementById('prevVehicleNumber').textContent,
    clientName: document.getElementById('prevClientName').textContent,
    clientMobile: document.getElementById('prevClientMobile').textContent,
    totalPrice: document.getElementById('prevPrice').textContent
  };

  // Prepare sheet data
  const wsData = [
    ['Client Details'],
    ['Date', clientDetails.date],
    ['Vehicle Model', clientDetails.vehicleModel],
    ['Vehicle Number', clientDetails.vehicleNumber],
    ['Client Name', clientDetails.clientName],
    ['Mobile Number', clientDetails.clientMobile],
    ['Total Price', clientDetails.totalPrice],
    [],
    ['Items'],
    ['Item Name', 'Quantity', 'Price'],
    ...previewItems.map(item => [item.item, item.quantity, item.price])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Add basic formatting: borders and bold headers
  const range = XLSX.utils.decode_range(ws['!ref']);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      const cell = ws[cell_ref];
      if (cell) {
        cell.s = {
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } }
          },
          alignment: {
            vertical: "center",
            horizontal: "left",
            wrapText: true
          },
          font: R === 0 || R === 8 ? { bold: true } : {}  // Bold headers
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Full Bill');
  XLSX.writeFile(wb, `${clientDetails.clientName}_Bill.xlsx`);

  alert("Bill saved & styled Excel exported!");

  // Reset preview
  previewItems = [];
  totalPreviewPrice = 0;
  document.getElementById('itemPreviewBody').innerHTML = '';
  document.getElementById('tdPrice').textContent = '0.00';
  document.getElementById('prevPrice').textContent = '0.00';

  fetchBilling();
}


function exportFullBillToExcel(billData) {
  const wb = XLSX.utils.book_new();

  // Client Details Sheet
  const clientSheetData = [
    ["Client Name", billData.client.name],
    ["Mobile Number", billData.client.mobile],
    ["Vehicle Model", billData.client.vehicleModel],
    ["Vehicle Number", billData.client.vehicleNumber],
    ["Date", billData.client.date],
    ["Total Price", billData.total]
  ];
  const clientSheet = XLSX.utils.aoa_to_sheet(clientSheetData);
  XLSX.utils.book_append_sheet(wb, clientSheet, "Client Details");

  // Item Details Sheet
  const itemHeader = [["Item", "Quantity", "Price"]];
  const itemRows = billData.items.map(i => [i.item, i.quantity, i.price]);
  const itemSheet = XLSX.utils.aoa_to_sheet(itemHeader.concat(itemRows));
  XLSX.utils.book_append_sheet(wb, itemSheet, "Items");

  // Save File
  XLSX.writeFile(wb, "Full_Bill.xlsx");
}

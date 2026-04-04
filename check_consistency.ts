import { ITEMS, ACTIONS } from './src/constants';

const itemIds = new Set(Object.keys(ITEMS));
const missingItems = new Set();

ACTIONS.forEach(action => {
  action.inputs?.forEach(input => {
    if (!itemIds.has(input.itemId)) {
      missingItems.add(input.itemId);
    }
  });
  action.outputs?.forEach(output => {
    if (!itemIds.has(output.itemId)) {
      missingItems.add(output.itemId);
    }
  });
});

if (missingItems.size > 0) {
  console.log('Missing items in ACTIONS:');
  missingItems.forEach(item => console.log(`- ${item}`));
} else {
  console.log('No missing items found in ACTIONS.');
}

// Check for duplicate items in ITEMS
const ids = Object.keys(ITEMS);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length > 0) {
  console.log('Duplicate items in ITEMS:');
  duplicates.forEach(id => console.log(`- ${id}`));
} else {
  console.log('No duplicate items found in ITEMS.');
}

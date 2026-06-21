// Shared array holding active auction items
export const useMyItems = () => useState('my_marketplace_items', () => []);

/**
 * Sends item to backend API and adds to global tracking list
 * @param {Object} item
 */
export async function registerMarketplaceItem(item) {
  try {
    // POST request to backend API endpoint
    const newItem = await $fetch('/api/items/items', {
      method: 'POST',
      body: item,
    });

    // Add returned item from database to state
    const items = useMyItems();
    items.value.push(newItem);

    //Nuxt clears the form after submission, so we return the new item to reset the form fields
    if (item.category) {
      await refreshNuxtData(`category-${item.category}`); // Refresh category items list if category is specified
    } else {
      await refreshNuxtData(); // Refresh my items list if no category specified
    }

    return newItem;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
}

/**
 * Deletes an item from the database
 * @param {Number} itemId - The ID of the item to delete
 */
export async function deleteMarketplaceItem(itemId) {
  try {
    const response = await $fetch(`/api/items/${itemId}`, {
      method: 'DELETE',
    });

    // Remove item from local state if you use a global state composable
    try {
      const items = useMyItems();
      if (items && items.value) {
        items.value = items.value.filter((item) => item.id !== itemId);
      }
    } catch (stateError) {
      console.error('Failed to update local state after deletion:', stateError);
    }

    return response;
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}

//chooses what to display based on the category in the URL, and fetches all items that match that
category from the API. It also handles loading and error states, and displays the items in a grid
using the ItemCard component.
<script setup>
const route = useRoute();

// Automatically grab the current category from the URL string
const categoryName = computed(() => route.params.name);

// Fetch all matching listings from your single items API file
const {
  data: items,
  pending,
  error,
} = await useFetch(() => `/api/items/items?category=${categoryName.value}`);
</script>

<template>
  <div class="category-container">
    <header class="category-header">
      <h1 class="category-title">{{ categoryName }} Auctions</h1>
      <p class="category-subtitle" v-if="items">
        There are {{ items.length }} live active auctions in this category.
      </p>
    </header>

    <div v-if="pending" class="loader-container">
      <div class="spinner"></div>
      <p>Synchronizing live market inventory...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>⚠️ Connection Error: Failed to sync current listings.</p>
    </div>

    <div v-else-if="items && items.length > 0" class="items-grid">
      <ItemCard v-for="singleItem in items" :key="singleItem.id" :item="singleItem" />
    </div>
  </div>
</template>

<style scoped>
.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.category-header {
  margin-bottom: 32px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 20px;
}

.breadcrumb {
  font-size: 0.85rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #111827;
  text-transform: capitalize;
  margin: 4px 0 8px 0;
}

.category-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Items Display Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

/* UI Feedback States */
.loader-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-container h3 {
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 8px;
}

.empty-container p {
  color: #6b7280;
  margin-bottom: 20px;
}

.btn-create-prompt {
  display: inline-block;
  background: #2563eb;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
}
</style>

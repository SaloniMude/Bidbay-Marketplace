// This component represents an individual item card in the category page loop. It receives item
data as a prop and displays the image, name, category, description, and starting bid. It also
includes a link to the individual item bidding page.
<script setup>
// Define the item prop coming from your category page loop
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="item-card">
    <img
      :src="item.imageUrl || 'https://via.placeholder.com/300'"
      :alt="item.name"
      class="item-image"
    />

    <div class="item-details">
      <span class="category-badge">{{ item.category }}</span>
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-description">{{ item.description }}</p>

      <div class="price-row">
        <span class="price-label">Starting Bid:</span>
        <span class="price-amount">₹{{ item.startingCost }}</span>
      </div>

      <NuxtLink :to="`/items/${item.id}`" class="btn-bid"> Place a Bid </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
}

.item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.item-details {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.category-badge {
  font-size: 0.75rem;
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 8px;
  border-radius: 9999px;
  align-self: flex-start;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

.item-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  margin-bottom: 16px;
}

.price-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.btn-bid {
  display: block;
  text-align: center;
  background: #2563eb;
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;
}

.btn-bid:hover {
  background: #1d4ed8;
}
</style>

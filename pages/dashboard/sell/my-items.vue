<script setup>
import { ref, onMounted } from 'vue';
import { registerMarketplaceItem, deleteMarketplaceItem } from '@/composables/useItems';

const headers = useRequestHeaders(['cookie']);

// Fetch the current user's listed items from the API with authentication
const { data: myItems, refresh } = await useFetch('/api/items/items', {
  query: { userItems: 'true' },
  headers,
  credentials: 'include',
  server: false,
  lazy: true,
});

const showAddForm = ref(false);

const handleNewItem = async (itemData) => {
  try {
    await registerMarketplaceItem(itemData);
    showAddForm.value = false;
    await refresh();
  } catch (error) {
    console.error('Error creating item:', error);
  }
};

const handleDeleteItem = async (itemId) => {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  try {
    await deleteMarketplaceItem(itemId);
    await refresh();
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

onMounted(async () => {
  if (typeof refresh === 'function') {
    await refresh();
  }
});

const formatBidDuration = (duration) => {
  const totalMinutes = Number(duration);
  if (Number.isNaN(totalMinutes)) return duration || '';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Helper function to check if the auction timeframe has cleared
const isAuctionExpired = (item) => {
  if (!item.createdAt || !item.bidDuration) return false;

  const startTime = new Date(item.createdAt).getTime();
  const durationMs = item.bidDuration * 60 * 1000; // Converts minutes to milliseconds
  const expirationTime = startTime + durationMs;

  return Date.now() > expirationTime;
};
</script>

<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">My Listed Inventory</h1>
        <p class="text-sm text-slate-500 mt-1">
          Manage and track your published items live on Bidbay.
        </p>
      </div>
      <button
        @click="showAddForm = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700 transition-colors"
      >
        Add Item
      </button>
    </div>

    <div v-if="showAddForm" class="mb-8">
      <SellItemsForm @submit="handleNewItem" />
    </div>

    <div
      v-else-if="!myItems || myItems?.length === 0"
      class="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-md mx-auto mt-8"
    >
      <svg
        class="mx-auto h-12 w-12 text-slate-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-semibold text-slate-900">No active listings found</h3>
      <p class="mt-1 text-sm text-slate-500">
        Get started by creating your first listing product entry card inside the market workspace.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in myItems"
        :key="item.id"
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
      >
        <div>
          <div class="relative h-48 w-full bg-slate-100">
            <img
              :src="item.imageUrl"
              alt="Product Listing Cover"
              class="w-full h-full object-cover"
            />
            <span
              class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white font-medium text-xs px-2.5 py-1 rounded-full uppercase tracking-wider"
            >
              {{ item.category }}
            </span>

            <span
              v-if="isAuctionExpired(item)"
              class="absolute top-3 right-3 bg-red-600/95 backdrop-blur-sm text-white font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
            >
              Sold
            </span>
            <span
              v-else
              class="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-sm text-white font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
            >
              Active
            </span>
          </div>

          <div class="p-5">
            <h3 class="font-bold text-lg text-slate-900 truncate mb-1">{{ item.name }}</h3>
            <p class="text-slate-500 text-sm line-clamp-2 min-h-[40px] mb-4">
              {{ item.description }}
            </p>

            <div class="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <span class="text-xs font-semibold text-slate-400 block uppercase tracking-tight"
                  >Starting Value</span
                >
                <span class="text-xl font-bold text-violet-600">₹{{ item.startingCost }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold text-slate-400 block uppercase tracking-tight"
                  >Time Frame Limit</span
                >
                <span
                  class="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md inline-block mt-0.5 border border-amber-200/50"
                >
                  {{ formatBidDuration(item.bidDuration) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between"
        >
          <div class="flex gap-3 items-center">
            <button class="text-xs text-slate-500 hover:text-violet-600 font-semibold transition">
              View Bids &rarr;
            </button>

            <button
              v-if="!isAuctionExpired(item)"
              @click="handleDeleteItem(item.id)"
              class="text-xs text-red-600 hover:text-red-700 font-semibold transition hover:underline"
            >
              Delete
            </button>
            <span
              v-else
              class="text-xs text-slate-400 font-medium italic bg-slate-200/60 px-2 py-0.5 rounded cursor-not-allowed select-none"
            >
              Locked (Sold)
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

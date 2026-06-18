<script setup>
import { ref } from 'vue';
import { UseElementSize } from '@vueuse/components';

const name = ref('');
const description = ref('');
const category = ref('Electronics');
const bidDurationHours = ref(1);
const bidDurationMinutes = ref(0);
const imageUrl = ref('');
const startingCost = ref(0);

const emit = defineEmits(['submit']);

const handleSubmit = () => {
  const totalBidDuration = bidDurationHours.value * 60 + bidDurationMinutes.value;
  const formData = {
    name: name.value,
    description: description.value,
    category: category.value,
    bidDuration: totalBidDuration,
    imageUrl: imageUrl.value,
    startingCost: parseFloat(startingCost.value),
    userId: 1,
  };

  // Send data to the parent page (i.e. my-items.vue) for processing and API submission
  emit('submit', formData);
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-lg mx-auto">
    <h2 class="text-lg font-bold text-slate-900 mb-6">List New Auction Item</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full rounded-lg border-slate-200 focus:border-violet-500 focus:ring-violet-500"
          placeholder="e.g. Vintage Camera"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
        <input
          v-model="imageUrl"
          type="url"
          required
          class="w-full rounded-lg border-slate-200 focus:border-violet-500 focus:ring-violet-500"
          placeholder="https://example.com/image.jpg"
        />

        <div v-if="imageUrl" class="mt-2">
          <label
            class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
            >Link Preview Verification</label
          >
          <div
            class="flex items-center justify-center border border-slate-200 bg-slate-50 rounded-xl p-3 h-32 overflow-hidden relative"
          >
            <img
              :src="imageUrl"
              @error="
                (e) =>
                  (e.target.src =
                    'https://placehold.co/400x250/f1f5f9/475569?text=Image+Link+Format+Unsupported')
              "
              class="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              alt="Real-time listing thumbnail"
            />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Starting Cost</label>
        <input
          v-model.number="startingCost"
          type="number"
          min="0"
          step="0.01"
          required
          class="w-full rounded-lg border-slate-200 focus:border-violet-500 focus:ring-violet-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <UseElementSize as="div" class="w-full">
          <template #default="{ width }">
            <textarea
              v-model="description"
              required
              :rows="width > 640 ? 4 : 6"
              :style="{ minHeight: width > 640 ? '120px' : '150px' }"
              class="w-full rounded-lg border-slate-200 focus:border-violet-500 focus:ring-violet-500 px-3 py-2"
              placeholder="Describe your item..."
            ></textarea>
            <p class="mt-2 text-xs text-slate-500">Description box adjusts with container width.</p>
          </template>
        </UseElementSize>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            v-model="category"
            class="w-full rounded-lg border-slate-200 focus:border-violet-500 focus:ring-violet-500"
          >
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Collectibles</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Duration</label>
          <div class="grid grid-cols-2 gap-1">
            <div class="flex items-center gap-2">
              <input
                v-model.number="bidDurationHours"
                type="number"
                min="0"
                max="48"
                class="w-full h-10 rounded-md border border-slate-200 px-3 text-sm text-slate-900 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Hours"
              />
              <span class="text-sm text-slate-500">hrs</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="bidDurationMinutes"
                type="number"
                min="0"
                max="59"
                class="w-full h-10 rounded-md border border-slate-200 px-3 text-sm text-slate-900 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Minutes"
              />
              <span class="text-sm text-slate-500">mins</span>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">Enter exact duration in hours and minutes.</p>
        </div>
      </div>

      <button
        type="submit"
        class="w-full mt-4 bg-violet-600 text-white font-semibold py-2 rounded-lg hover:bg-violet-700 transition"
      >
        Post Auction
      </button>
    </form>
  </div>
</template>

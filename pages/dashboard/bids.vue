<script setup>
import { onMounted, watch } from 'vue';

const user = useCurrentUser();

// Fetch the newly shaped object containing { active: [], won: [] }
const {
  data: biddingDashboard,
  refresh,
  pending,
} = await useAsyncData('child-dashboard-bids', () => $fetch('/api/dashboard/bids'), {
  server: false,
});

watch(
  user,
  (newUser) => {
    if (newUser) {
      refresh();
    }
  },
  { immediate: true }
);

onMounted(() => {
  refresh();
});
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-10">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Bidding Activity Hub</h1>
      <p class="text-sm text-slate-500 mt-1">
        Monitor your ongoing live marketplace auctions and celebrate your finalized won
        acquisitions.
      </p>
    </div>

    <div
      v-if="pending"
      class="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 border-dashed rounded-xl"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-3"></div>
      <p class="text-sm text-slate-500">Synchronizing your live auction standings...</p>
    </div>

    <div
      v-else-if="!biddingDashboard?.active?.length && !biddingDashboard?.won?.length"
      class="text-center p-12 bg-white border border-slate-200 border-dashed rounded-xl"
    >
      <div
        class="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full text-slate-400 mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-slate-900 mb-1">No Activity Logged</h3>
      <p class="text-sm text-slate-500 max-w-sm mx-auto">
        You haven't interacted with any auction listings yet. Head over to the public marketplace
        catalog to place your first bid!
      </p>
    </div>

    <div v-else class="space-y-10">
      <section>
        <div class="mb-4 border-b border-slate-200 pb-2">
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Current Live Auctions
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Auctions that are still running with active timers.
          </p>
        </div>

        <div
          v-if="!biddingDashboard?.active?.length"
          class="text-sm text-slate-500 italic p-6 bg-slate-50 rounded-xl border border-slate-200 text-center"
        >
          You aren't participating in any active live auctions right now.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="bid in biddingDashboard.active"
            :key="bid.id"
            class="flex bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-bl-lg shadow-sm text-white"
              :class="bid.isWinning ? 'bg-emerald-600' : 'bg-amber-500'"
            >
              {{ bid.isWinning ? 'Highest Bidder' : 'Outbid' }}
            </div>

            <img
              :src="bid.item?.imageUrl || 'https://via.placeholder.com/150'"
              :alt="bid.item?.name"
              class="w-24 h-24 object-cover rounded-lg bg-slate-50 flex-shrink-0 border border-slate-100"
            />
            <div class="ml-4 flex flex-col justify-between overflow-hidden flex-1 pr-16">
              <div>
                <h3 class="text-sm font-semibold text-slate-900 truncate">{{ bid.item?.name }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Market Value: ₹{{ bid.item?.startingCost }}
                </p>
              </div>
              <div class="mt-2 space-y-1">
                <p class="text-xs text-slate-600">
                  Your High Bid: <span class="font-bold text-slate-900">₹{{ bid.amount }}</span>
                </p>
                <p class="text-xs text-slate-500">
                  Current Price:
                  <span
                    class="font-bold"
                    :class="bid.isWinning ? 'text-emerald-600' : 'text-rose-600'"
                    >₹{{ bid.currentHighestBid }}</span
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="mb-4 border-b border-slate-200 pb-2">
          <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              />
            </svg>
            Auctions Won
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Auctions that have concluded where you held the highest winning bid.
          </p>
        </div>

        <div
          v-if="!biddingDashboard?.won?.length"
          class="text-sm text-slate-500 italic p-6 bg-slate-50 rounded-xl border border-slate-200 text-center"
        >
          You haven't won any closed auctions yet.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="bid in biddingDashboard.won"
            :key="bid.id"
            class="flex bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 bg-amber-500 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-lg shadow-sm"
            >
              Winner
            </div>

            <img
              :src="bid.item?.imageUrl || 'https://via.placeholder.com/150'"
              :alt="bid.item?.name"
              class="w-24 h-24 object-cover rounded-lg bg-slate-50 flex-shrink-0 border border-slate-100"
            />
            <div class="ml-4 flex flex-col justify-between overflow-hidden flex-1 pr-12">
              <div>
                <h3 class="text-sm font-semibold text-slate-900 truncate">{{ bid.item?.name }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  Original Cost: ₹{{ bid.item?.startingCost }}
                </p>
              </div>
              <div
                class="bg-emerald-50 border border-emerald-100 rounded-md px-2.5 py-1.5 mt-2 self-start"
              >
                <p class="text-xs font-medium text-emerald-700">
                  Your Winning Bid: <span class="font-bold">₹{{ bid.amount }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

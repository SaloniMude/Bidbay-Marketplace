<script setup>
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue';

const route = useRoute();
const itemId = route.params.id;

// Connect to auth session
const user = useCurrentUser();

// Fetch initial details of this single item from your backend
const {
  data: itemData,
  pending,
  error,
} = await useFetch('/api/items/items', {
  query: { id: itemId },
});

const item = computed(() => (Array.isArray(itemData.value) ? itemData.value[0] : itemData.value));

// 2. Setup reactive live state tracking
const livePrice = ref(0);
const liveBidsLog = ref([]);
const userBidInput = ref('');
let socket = null;

watchEffect(() => {
  if (item.value) {
    // Initialize the live price with the current highest bid or starting cost
    if (item.value.bids && item.value.bids.length > 0) {
      livePrice.value = Number(item.value.bids[0].amount);
    } else {
      livePrice.value = Number(item.value.startingCost);
    }

    if (item.value.bids && liveBidsLog.value.length === 0) {
      liveBidsLog.value = item.value.bids.map((bid) => {
        // user-friendly display name logic for the activity log
        const finalName =
          bid.user?.username || (bid.user?.email ? bid.user.email.split('@')[0] : 'Anonymous');

        return {
          id: bid.id,
          text: `${finalName} placed a bid of ₹${bid.amount}`,
        };
      });
    }
  }
});

// Connect real-time WebSockets engine upon layout render
onMounted(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//${window.location.host}/ws/bids`);

  socket.onopen = () => {
    socket.send(JSON.stringify({ action: 'join', itemId: itemId }));
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === 'BID_UPDATED' && String(message.itemId) === String(itemId)) {
        //  Instantly update the master live price tag on screen
        livePrice.value = Number(message.latestBid);

        // Add a clean, descriptive activity log item to the top of the feed
        liveBidsLog.value.unshift({
          id: Date.now(),
          text: `${message.bidderName} placed a bid of ₹${message.latestBid}`,
        });
      }
    } catch (err) {
      console.error('Error parsing inbound socket message:', err);
    }
  };
});

onBeforeUnmount(() => {
  if (socket) socket.close();
});

//Send bid actions down the open WebSocket pipe
const executeBidSubmit = () => {
  if (!user || !user.value) {
    alert('You must be logged in to place a bid.');
    return;
  }
  const absoluteBid = parseFloat(userBidInput.value);

  if (!absoluteBid || absoluteBid <= livePrice.value) {
    alert(`Invalid Bid Amount. Your bid must be strictly higher than ₹${livePrice.value}`);
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    const activeBidderName =
      user.value.username || (user.value.email ? user.value.email.split('@')[0] : 'Anonymous');

    socket.send(
      JSON.stringify({
        action: 'place-bid',
        itemId: itemId,
        amount: absoluteBid,
        userId: user.value.id,
        username: activeBidderName, // Sent clean display name up to the WebSocket channel
      })
    );
    userBidInput.value = '';
  }
};
</script>

<template>
  <div class="auction-workspace">
    <div v-if="pending" class="loading-state">Syncing unique item record...</div>
    <div v-else-if="error || !item" class="error-state">
      The requested listing item does not exist.
    </div>

    <div v-else class="auction-grid">
      <article class="product-showcase">
        <div class="image-frame">
          <img :src="item.imageUrl || 'https://via.placeholder.com/600x400'" :alt="item.name" />
        </div>
        <header>
          <span class="category-pill">{{ item.category }}</span>
          <h1 class="item-title">{{ item.name }}</h1>
        </header>
        <p class="item-description">{{ item.description }}</p>
      </article>

      <aside class="interaction-sidebar">
        <div class="sticky-panel">
          <div class="price-header">
            <h3>Live Market Value</h3>
            <div class="live-price-tag">₹{{ livePrice }}</div>
          </div>

          <div class="bidding-form">
            <label for="bidAmount" class="input-label">Place Counter Bid</label>
            <div class="input-wrapper">
              <span class="currency-marker">₹</span>
              <input
                id="bidAmount"
                v-model="userBidInput"
                type="number"
                :placeholder="`Min. ₹${livePrice + 1}`"
                class="field-input"
              />
            </div>
            <button @click="executeBidSubmit" class="btn-submit-bid">Submit Instant Bid</button>
          </div>

          <div class="ticker-box">
            <h4>Live Feed Activity</h4>
            <TransitionGroup name="list" tag="ul" class="ticker-list">
              <li v-for="log in liveBidsLog" :key="log.id" class="ticker-item">
                <span class="pulse-dot"></span> {{ log.text }}
              </li>
            </TransitionGroup>
            <p v-if="liveBidsLog.length === 0" class="ticker-fallback">
              No live bids recorded on this connection session yet.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* (Styles omitted for brevity, your CSS classes are perfectly configured) */
.loading-state,
.error-state {
  text-align: center;
  padding: 80px 20px;
  font-size: 1.2rem;
  color: #4b5563;
}
.auction-workspace {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}
.auction-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 50px;
}
.image-frame {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #f3f4f6;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}
.image-frame img {
  width: 100%;
  height: auto;
  display: block;
}
.category-pill {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
}
.item-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin: 12px 0;
}
.item-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4b5563;
}
.sticky-panel {
  position: sticky;
  top: 40px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.price-header {
  text-align: center;
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}
.price-header h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.live-price-tag {
  font-size: 3.5rem;
  font-weight: 800;
  color: #059669;
}
.bidding-form {
  margin-bottom: 30px;
}
.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.currency-marker {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  font-size: 1.2rem;
  font-weight: 500;
}
.field-input {
  width: 100%;
  padding: 14px 14px 14px 32px;
  font-size: 1.2rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}
.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.btn-submit-bid {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-submit-bid:hover {
  background: #1d4ed8;
}
.ticker-box h4 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 8px;
  margin-bottom: 12px;
}
.ticker-list {
  list-style: none;
  padding: 0;
  max-height: 180px;
  overflow-y: auto;
}
.ticker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #fafafa;
  font-size: 0.9rem;
  color: #4b5563;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
.ticker-fallback {
  font-size: 0.85rem;
  color: #9ca3af;
  text-align: center;
  padding: 10px 0;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

//websocket logic for live bidding

import { prisma } from '~/server/utils/prisma';

export default defineWebSocketHandler({
  open(peer) {
    console.log(` WebSocket connected: ${peer.id}`);
  },
  async message(peer, message) {
    try {
      const data = JSON.parse(message.text());

      // 1. Handle Room Subscription
      if (data.action === 'join') {
        const roomName = `item-${String(data.itemId)}`;
        peer.subscribe(roomName);
      }

      // 2. Handle Live Bid Submission
      if (data.action === 'place-bid') {
        const itemId = Number(data.itemId);
        const userId = Number(data.userId);
        const bidAmount = parseFloat(data.amount);
        const username = data.username || 'Anonymous Bidder';

        if (isNaN(itemId) || isNaN(userId) || isNaN(bidAmount)) return;

        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) return;

        // Check if auction is over
        const start = new Date(item.createdAt).getTime();
        const durationMs = item.bidDuration * 60 * 1000; // Match your duration unit (minutes vs hours)
        if (start + durationMs < Date.now()) {
          peer.send(JSON.stringify({ type: 'ERROR', message: 'This auction has already ended!' }));
          return;
        }

        // Save bid to DB so it immediately reflects on the user's dashboard
        await prisma.bid.create({
          data: {
            amount: bidAmount,
            itemId: itemId,
            userId: userId,
          },
        });

        // Update the item's current cost in the marketplace
        await prisma.item.update({
          where: { id: itemId },
          data: { startingCost: bidAmount },
        });

        // Prepare payload
        const updatePayload = {
          type: 'BID_UPDATED',
          itemId: String(itemId),
          latestBid: bidAmount,
          bidderName: username,
        };

        const roomName = `item-${String(itemId)}`;

        //  Force JSON stringification so other instances don't receive "[object Object]"
        peer.publish(roomName, JSON.stringify(updatePayload));

        // Echo back to the person who submitted the bid
        peer.send(JSON.stringify(updatePayload));
      }
    } catch (error) {
      console.error(' WebSocket handler error:', error);
    }
  },
  close(peer) {
    const roomName = `item-${String(peer.id)}`;
    peer.unsubscribe(roomName);
  },
});

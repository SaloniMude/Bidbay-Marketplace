// This API route compiles the bidding dashboard data for the logged-in user. It fetches all items and their bid histories, then filters and categorizes them into active bids (ongoing auctions where the user has placed a bid) and won auctions (concluded auctions where the user had the winning bid). The response is structured to provide all necessary details for the frontend to display the user's bidding activity effectively.
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const authenticatedUser = event.context.user;
  if (!authenticatedUser) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized access to bid history.' });
  }

  try {
    const targetUserId = Number(authenticatedUser.id);

    // Fetch all items along with their complete bid history
    const allItems = await prisma.item.findMany({
      include: {
        bids: {
          orderBy: { amount: 'desc' }, // Order bids from highest to lowest
        },
      },
    });

    const activeBids: any[] = [];
    const wonAuctions: any[] = [];

    // Filter and categorize items based on current time and user activity
    allItems.forEach((item) => {
      // Find all bids placed by the logged-in user on this specific item
      const userBidsOnItem = item.bids.filter((b) => b.userId === targetUserId);
      if (userBidsOnItem.length === 0) return; // Skip items the user hasn't bid on

      const startTime = new Date(item.createdAt).getTime();
      const durationMs = item.bidDuration * 60 * 1000; // converts minutes to ms
      const hasExpired = startTime + durationMs < Date.now();

      const highestBid = item.bids[0]; // The absolute highest bid on the item
      const userHighestBid = userBidsOnItem[0]; // The user's personal highest bid

      if (!highestBid || !userHighestBid) return; // if arrays are empty for some reason, skip

      if (hasExpired) {
        // Check if the user held the winning spot
        if (highestBid && highestBid.userId === targetUserId) {
          wonAuctions.push({
            id: item.id,
            amount: highestBid.amount,
            createdAt: highestBid.createdAt,
            item: item,
          });
        }
      } else {
        // Ongoing Live Auction
        activeBids.push({
          id: userHighestBid.id,
          amount: userHighestBid.amount, // Personal highest bid
          currentHighestBid: highestBid.amount, // Overall winning price right now
          isWinning: highestBid.userId === targetUserId, // Is the user currently winning?
          createdAt: userHighestBid.createdAt,
          item: item,
        });
      }
    });

    // Return separated lists back to the frontend
    return {
      active: activeBids,
      won: wonAuctions,
    };
  } catch (error) {
    console.error('Error compiling bidding dashboard profiles:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to synchronize bid tracking streams.',
    });
  }
});

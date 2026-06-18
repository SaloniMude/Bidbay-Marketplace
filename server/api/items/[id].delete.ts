// server/api/items/[id].delete.ts
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Item ID is required' });
  }

  const itemId = Number(id);
  if (isNaN(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Item ID format' });
  }

  try {
    // 🎯 FIX: Execute sequential deletions inside a transaction
    const [deletedBids, deletedItem] = await prisma.$transaction([
      // 1. First, wipe out all real-time historical bids linked to this item
      prisma.bid.deleteMany({
        where: { itemId: itemId },
      }),
      // 2. Now that the foreign keys are cleared, safe to remove the main listing item
      prisma.item.delete({
        where: { id: itemId },
      }),
    ]);

    console.log(`Successfully purged item ID ${itemId} and cleared ${deletedBids.count} bids.`);

    return {
      success: true,
      message: 'Item and its active bid logs deleted successfully',
      item: deletedItem,
    };
  } catch (error: any) {
    console.error('Error deleting item:', error);

    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Item not found' });
    }

    throw createError({ statusCode: 500, statusMessage: 'Failed to delete item' });
  }
});

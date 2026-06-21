// This API route handles the deletion of a listing item. It first ensures that all associated bids are removed to maintain database integrity, then proceeds to delete the item itself. The operation is wrapped in a transaction to guarantee that either both deletions succeed or neither does, preventing orphaned records and ensuring consistent state. Proper error handling is implemented to provide clear feedback on failure scenarios, such as invalid item IDs or database issues.
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
    // 1. Use a transaction to ensure both deletions happen atomically
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

// This API route handles all CRUD operations related to marketplace items. It supports:
// - GET: Fetching items with optional filters for category, user-specific listings, or single item details.
// - POST: Creating new listing items, ensuring that the authenticated user's ID is securely associated with the new item.
// - DELETE: Removing items, with strict checks to ensure only the owner can delete their listings. All operations include robust error handling to provide clear feedback on failure scenarios.
import { prisma } from '~/server/utils/prisma';

export default defineEventHandler(async (event) => {
  const method = event.method;

  //  READING FROM THE DATABASE (GET)
  if (method === 'GET') {
    const query = getQuery(event);
    const categoryFilter = query.category as string | undefined;
    const wantsUserItems = query.userItems === 'true' || query.userItems === true;
    const itemId = query.id ? Number(query.id) : undefined;

    try {
      // Single Item View Lifecycle (?id=X)
      if (itemId !== undefined && !isNaN(itemId)) {
        console.log('============= BACKEND DEBUG =============');
        console.log('The frontend requested Item ID:', itemId);

        const singleItem = await prisma.item.findUnique({
          where: { id: itemId },
          include: {
            bids: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        if (!singleItem) {
          throw createError({
            statusCode: 404,
            statusMessage: 'The requested listing item does not exist.',
          });
        }

        return singleItem;
      }

      // User's Own Listed Items Dashboard View (?userItems=true)
      if (wantsUserItems) {
        const authenticatedUser = event.context.user;
        if (!authenticatedUser) {
          throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
        }

        return await prisma.item.findMany({
          where: { userId: Number(authenticatedUser.id) },
          orderBy: { createdAt: 'desc' },
        });
      }

      // Main Marketplace / Category Browsing Feed
      const feedItems = await prisma.item.findMany({
        where: categoryFilter ? { category: { equals: categoryFilter.toLowerCase() } } : {},
        orderBy: { createdAt: 'desc' },
      });

      //  Drop items if their duration timeline has already passed
      const activeFeedItems = feedItems.filter((item) => {
        const startTime = new Date(item.createdAt).getTime();
        const durationInMs = item.bidDuration * 60 * 1000; // Converts minutes to milliseconds
        const expirationTime = startTime + durationInMs;

        return expirationTime > Date.now(); // Keeps the item ONLY if expiration is in the future
      });

      return activeFeedItems;
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error('Error fetching items:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to look up items from the database.',
      });
    }
  }

  //  WRITING TO THE DATABASE (POST)
  if (method === 'POST') {
    const authenticatedUser = event.context.user;

    if (!authenticatedUser) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const body = await readBody(event);

    try {
      const parsedBidDuration = Number(body.bidDuration);

      const newItem = await prisma.item.create({
        data: {
          name: body.name,
          description: body.description,
          category: body.category.toLowerCase(),
          bidDuration: Number.isNaN(parsedBidDuration) ? 0 : parsedBidDuration,
          imageUrl: body.imageUrl,
          startingCost: parseFloat(body.startingCost),
          // Securely override everything using server-verified User ID data type
          userId: Number(authenticatedUser.id),
        },
      });

      return newItem;
    } catch (error: any) {
      console.error('Error creating item:', error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create item: ${error.message}`,
      });
    }
  }

  //  REMOVING FROM THE DATABASE (DELETE)
  if (method === 'DELETE') {
    const authenticatedUser = event.context.user;

    if (!authenticatedUser) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    const query = getQuery(event);
    const id = query.id;

    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Item ID is required' });
    }

    try {
      const deleteResult = await prisma.item.deleteMany({
        where: {
          id: Number(id),

          userId: Number(authenticatedUser.id),
        },
      });

      if (deleteResult.count === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Item not found or you do not have permission to delete it.',
        });
      }

      return { success: true, message: 'Item deleted successfully' };
    } catch (error: any) {
      if (error.statusCode) throw error;
      console.error('Error deleting item:', error);
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete item' });
    }
  }
});

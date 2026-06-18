import { jwtVerify } from 'jose';

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'token');
    if (!token) return;

    // 1. Convert secret text to byte array matching the login step
    const secretText = process.env.JWT_SECRET || 'super-secret-development-key-32-chars-long';
    const secretKey = new TextEncoder().encode(secretText);

    // 2. Verify the token natively
    const { payload } = await jwtVerify(token, secretKey);

    // 3. Securely pass the userId down the request stream
    if (payload && payload.userId) {
      event.context.user = {
        id: payload.userId as number, //saves userId as an id ie number in context for use in API routes
      };
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    });
  }
});

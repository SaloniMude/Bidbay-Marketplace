export default defineEventHandler(async (event) => {
  // Clear the token cookie to log the user out
  deleteCookie(event, 'token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return { message: 'Logout successful' };
});

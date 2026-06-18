import { prisma } from '~/server/utils/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  //validation
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
  }

  //check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email or password' });
  }

  //compare password with hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email or password' });
  }

  //prepare secret key for signing JWT
  const secretText = process.env.JWT_SECRET || 'super-secret-development-key-32-chars-long';
  if (!secretText) {
    throw createError({ statusCode: 500, statusMessage: 'JWT secret is not defined' });
  }
  const secretKey = new TextEncoder().encode(secretText); //secret key for signing JWT, should be stored in environment variables (.env file)
  if (!secretKey) {
    throw createError({ statusCode: 500, statusMessage: 'JWT secret is not defined' });
  }

  //generate jose token
  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' }) // Explicitly set the encryption algorithm
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  //attach cookkie with token to response

  setCookie(event, 'token', token, {
    httpOnly: true, //makes the cookie inaccessible to JavaScript, helps prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', //only send cookie over HTTPS in production
    sameSite: 'strict', //helps prevent CSRF attacks by restricting when cookies are sent
    maxAge: 7 * 24 * 60 * 60, //cookie expires in 7 days (in seconds)
  });

  //return success response with token
  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
});

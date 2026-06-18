import { prisma } from '~/server/utils/prisma';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const method = event.method;
  const body = await readBody(event);
  const { email, password } = body;

  //validation
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
  }
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters long',
    });
  }

  //check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw createError({ statusCode: 400, statusMessage: 'User already exists' });
  }

  //hash and salt the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //save user to database

  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });

  //return success response
  return {
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
    },
  };
});

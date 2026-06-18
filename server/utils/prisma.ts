import { PrismaClient } from '@prisma/client' //import the prisma object from the prisma client package

const prismaClientSingleton = () => {
  return new PrismaClient() //create a new instance of the PrismaClient and return it
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
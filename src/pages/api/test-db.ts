import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/shared/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    res.status(200).json({ status: 'ok', users });
  } catch (error) {
    console.error('DB Connection Error:', error);
    res
      .status(500)
      .json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        error,
      });
  }
}

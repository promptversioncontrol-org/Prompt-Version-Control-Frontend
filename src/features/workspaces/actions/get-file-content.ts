'use server';

import { s3Client } from '@/shared/lib/s3-client';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function getFileContent(key: string) {
  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    // AWS SDK v3 returns body as a stream. We need to convert it to string.
    const str = await response.Body?.transformToString();

    return { success: true, content: str };
  } catch (error) {
    console.error('Error fetching file content:', error);
    return { success: false, error: 'Failed to fetch file content' };
  }
}

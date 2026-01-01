'use server';

import { s3Client } from '@/shared/lib/s3-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { randomUUID } from 'crypto';

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const fileKey = `support-attachments/${session.user.id}/${randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { success: true, signedUrl, publicUrl };
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    return { success: false, error: 'Failed to generate upload URL' };
  }
}

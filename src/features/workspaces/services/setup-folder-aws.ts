import { s3Client } from '@/shared/lib/s3-client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function createWorkspaceFolder(
  userId: string,
  workspaceSlug: string,
) {
  const bucketName = process.env.AWS_BUCKET_NAME!;

  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME is not configured');
  }

  const folderKey = `pvc/users/${userId}/workspaces/${workspaceSlug}/`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: folderKey,
      Body: '',
    });

    await s3Client.send(command);

    console.log(`✅ Folder created: ${folderKey}`);
    return { success: true, path: folderKey };
  } catch (error) {
    console.error('❌ Error creating folder:', error);
    throw error;
  }
}

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/lib/s3-client';

export async function listWorkspaceReportDates(
  workspaceId: string,
  userId: string,
) {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error('Missing bucket name');
  }

  // Old structure: pvc/workspaces/{workspaceId}/
  // New structure: pvc/workspaces/{workspaceId}/{userId}/
  const basePrefix = `pvc/workspaces/${workspaceId}/${userId}/`;

  console.log(`📂 Listing dates from: ${basePrefix}`);

  try {
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: basePrefix,
        Delimiter: '/',
      }),
    );

    const dates =
      listResponse.CommonPrefixes?.map((prefix) =>
        prefix.Prefix?.slice(basePrefix.length).replace(/\/$/, ''),
      ).filter((date): date is string => !!date) ?? [];

    return dates;
  } catch (error) {
    console.error('Error listing dates:', error);
    return [];
  }
}

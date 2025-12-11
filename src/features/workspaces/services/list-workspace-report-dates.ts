import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/lib/s3-client';

export async function listWorkspaceReportDates(workspaceId: string) {
  const bucket = process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error('Missing bucket name');
  }

  const basePrefix = `pvc/workspaces/${workspaceId}/`;

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
    ).filter(Boolean) ?? [];

  return dates;
}

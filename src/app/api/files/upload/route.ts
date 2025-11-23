import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/lib/s3-client';
import { auth } from '@/shared/lib/auth';

export async function POST(req: Request) {
  // Get session from server-side auth
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `pvc/users/${session.user.id}/${file.name}`,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      }),
    );

    return NextResponse.json({
      success: true,
      path: `pvc/users/${session.user.id}/${file.name}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

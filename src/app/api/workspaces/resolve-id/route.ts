import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url" field' },
        { status: 400 },
      );
    }

    let pathname;
    try {
      const parsedUrl = new URL(url);
      pathname = parsedUrl.pathname;
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 },
      );
    }

    if (pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const segments = pathname.split('/').filter(Boolean);

    if (segments.length < 2) {
      return NextResponse.json(
        {
          error:
            'URL does not contain enough segments to extract username and workspace',
        },
        { status: 400 },
      );
    }

    const workspaceSlug = segments[segments.length - 1];
    const username = segments[segments.length - 2];

    console.log(
      `Resolving ID for: User=${username}, Workspace=${workspaceSlug}`,
    );

    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: workspaceSlug,
        user: {
          username: username,
        },
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: workspace.id,
      username,
      workspaceSlug,
    });
  } catch (error) {
    console.error('Error resolving workspace ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

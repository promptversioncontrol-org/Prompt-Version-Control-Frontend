import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import crypto from 'crypto';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

console.log('🔥 USING UNIVERSAL CROSS-PLATFORM VERIFY ROUTE');

export async function POST(req: Request) {
  try {
    const { publicKey, signature, challenge } = await req.json();

    if (!publicKey || !signature || !challenge) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // Normalize (algorithm + keydata)
    const clean = publicKey.split(' ').slice(0, 2).join(' ');
    const fingerprint = crypto
      .createHash('sha256')
      .update(clean)
      .digest('base64');

    const key = await prisma.sshKey.findUnique({
      where: { fingerprint },
      include: { user: true },
    });

    if (!key) {
      return NextResponse.json(
        { error: 'SSH key not registered' },
        { status: 404 },
      );
    }

    // Verify challenge hasn't expired
    const verification = await prisma.verification.findUnique({
      where: { identifier: `ssh-${fingerprint}` },
    });

    if (!verification || verification.value !== challenge) {
      return NextResponse.json(
        { error: 'Invalid or expired challenge' },
        { status: 401 },
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Challenge expired' }, { status: 401 });
    }

    // CROSS-PLATFORM TEMP FILES
    const tmp = os.tmpdir();
    const base = path.join(tmp, `pvc_${Date.now()}`);
    const challengePath = `${base}_challenge`;
    const sigPath = `${base}.sig`;
    const pubPath = `${base}.pub`;
    const allowedPath = `${base}_allowed`; // NEW: allowed_signers file

    try {
      // Write files
      fs.writeFileSync(challengePath, Buffer.from(challenge, 'utf8'));
      fs.writeFileSync(sigPath, Buffer.from(signature, 'base64'));

      // Create allowed_signers file (required format: "principal key-type key-data")
      const allowedContent = `pvc ${clean}`;
      fs.writeFileSync(allowedPath, allowedContent);

      const challengeBuf = fs.readFileSync(challengePath);

      let verified = false;
      try {
        // FIX: Add -I flag with principal identity
        execSync(
          `ssh-keygen -Y verify -f "${allowedPath}" -I pvc -n pvc -s "${sigPath}"`,
          { input: challengeBuf },
        );
        verified = true;
      } catch (err) {
        console.error('SSH verify ERROR:', err);
        verified = false;
      }

      if (!verified) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        );
      }

      // Delete used challenge
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      // Create session
      const session = await prisma.session.create({
        data: {
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          userId: key.userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        },
      });

      return NextResponse.json(
        {
          ok: true,
          sessionToken: session.token,
          userId: key.userId,
          username: key.user.username || key.user.name,
        },
        { status: 200 },
      );
    } finally {
      // Cleanup temp files
      try {
        if (fs.existsSync(challengePath)) fs.unlinkSync(challengePath);
        if (fs.existsSync(sigPath)) fs.unlinkSync(sigPath);
        if (fs.existsSync(pubPath)) fs.unlinkSync(pubPath);
        if (fs.existsSync(allowedPath)) fs.unlinkSync(allowedPath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    }
  } catch (e) {
    console.error('Verify fatal:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

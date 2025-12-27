'use client';

import { useState } from 'react';
import { authClient, useSession } from '@/shared/lib/auth-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import QRCode from 'react-qr-code';

export function TwoFactorSetup() {
  const { data: session } = useSession();
  const [password, setPassword] = useState('');
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.twoFactor.enable({
        password,
      });
      if (res.error) {
        setError(res.error.message || 'Failed to enable 2FA');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTotpUri((res.data as any).totpURI);
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.twoFactor.enable({
        password,
        code: verificationCode,
      });
      if (res.error) {
        setError(res.error.message || 'Failed to enable 2FA');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBackupCodes((res.data as any).backupCodes);
        setTotpUri(null); // Clear QR code
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authClient.twoFactor.disable({
        password,
      });
      if (res.error) {
        setError(res.error.message || 'Failed to disable 2FA');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  if (session.user.twoFactorEnabled && !backupCodes) {
    return (
      <Card className="bg-black border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Two-factor authentication is currently enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password-disable" className="text-white">
                Confirm Password to Disable
              </Label>
              <Input
                id="password-disable"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={isLoading || !password}
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (backupCodes) {
    return (
      <Card className="bg-black border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">2FA Enabled Successfully</CardTitle>
          <CardDescription className="text-zinc-400">
            Please save these backup codes in a safe place. You will not be able
            to see them again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-zinc-950 p-4 rounded-md font-mono text-sm border border-zinc-800 text-zinc-300">
            {backupCodes.map((code, i) => (
              <div key={i}>{code}</div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setBackupCodes(null)}
            className="bg-white text-black hover:bg-zinc-200"
          >
            Done
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {!totpUri ? (
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to start"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <Button
                onClick={handleEnable2FA}
                disabled={isLoading || !password}
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isLoading ? 'Loading...' : 'Start Setup'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCode value={totpUri} size={200} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-white">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code from your app"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                onClick={handleVerifyAndEnable}
                disabled={isLoading || !verificationCode}
                className="bg-white text-black hover:bg-zinc-200"
              >
                {isLoading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { authClient } from '@/shared/lib/auth-client';
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
import { useSession } from '@/shared/lib/auth-client';

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
        setTotpUri(res.data.totpURI);
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
        setBackupCodes(res.data.backupCodes);
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
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Two-factor authentication is currently enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password-disable">
                Confirm Password to Disable
              </Label>
              <Input
                id="password-disable"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
      <Card>
        <CardHeader>
          <CardTitle>2FA Enabled Successfully</CardTitle>
          <CardDescription>
            Please save these backup codes in a safe place. You will not be able
            to see them again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-zinc-950 p-4 rounded-md font-mono text-sm">
            {backupCodes.map((code, i) => (
              <div key={i}>{code}</div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setBackupCodes(null)}>Done</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {!totpUri ? (
            <div className="grid gap-2">
              <Label htmlFor="password">Confirm Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to start"
              />
              <Button
                onClick={handleEnable2FA}
                disabled={isLoading || !password}
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
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code from your app"
                />
              </div>
              <Button
                onClick={handleVerifyAndEnable}
                disabled={isLoading || !verificationCode}
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

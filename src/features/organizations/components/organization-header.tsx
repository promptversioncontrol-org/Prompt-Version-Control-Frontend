import { OrganizationWithDetails } from '@/features/organizations/types/organization.types';
import { Organization } from '@prisma/client';

interface OrganizationHeaderProps {
  organization: Organization & {
    _count: { workspaces: number; members: number };
  };
  userRole: string;
}

export function OrganizationHeader({
  organization,
  userRole,
}: OrganizationHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6">
      <div className="flex items-center gap-5">
        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-300 text-2xl font-bold border border-zinc-700/50 shadow-2xl shadow-black/50">
          {organization.image ? (
            <img
              src={organization.image}
              alt={organization.name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            getInitials(organization.name)
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {organization.name}
          </h1>
          <p className="text-zinc-400 max-w-lg leading-relaxed">
            {organization.description || `${organization.name} Organization`}
          </p>
          <div className="flex gap-4 pt-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {organization.industry && (
              <span className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                {organization.industry}
              </span>
            )}
            {organization.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                {organization.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
              Role: <span className="text-zinc-300">{userRole}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">{/* Actions can go here */}</div>
    </div>
  );
}

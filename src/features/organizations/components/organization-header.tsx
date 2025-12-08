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
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20">
          {organization.image ? (
            <img
              src={organization.image}
              alt={organization.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            organization.name.substring(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {organization.name}
          </h1>
          <p className="text-muted-foreground">{organization.description}</p>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>{organization.industry}</span>
            {organization.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-primary"
              >
                {organization.website}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2"></div>
    </div>
  );
}

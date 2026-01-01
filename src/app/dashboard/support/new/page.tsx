import { CreateTicketForm } from '@/features/support/components/create-ticket-form';

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create Support Ticket
        </h1>
        <p className="text-zinc-400">
          Describe your issue and our team will help you as soon as possible.
        </p>
      </div>

      <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-6">
        <CreateTicketForm />
      </div>
    </div>
  );
}

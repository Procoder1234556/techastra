export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Superadmin Dashboard</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        MailerHub core (templates/campaigns), uploads, and payments are available on the local API.
        Log in as <code className="text-sm">admin@techastra.local</code> to access this
        route.
      </p>
    </div>
  );
}

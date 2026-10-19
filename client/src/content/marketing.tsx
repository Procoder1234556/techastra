export const faqContent = (
  <div className="space-y-6 text-sm">
    <div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">Is Techastra free for students?</h3>
      <p className="mt-1">Yes — browsing and registering for most events is free. Paid hackathons show the price before checkout.</p>
    </div>
    <div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">How does 1-click registration work?</h3>
      <p className="mt-1">Sign in once, complete your profile, and register for any open event without re-entering details.</p>
    </div>
    <div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">Can I host my college hackathon?</h3>
      <p className="mt-1">Use Host Event to publish your listing, collect registrations, run check-in, and send certificates.</p>
    </div>
    <div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">What are DevQuests?</h3>
      <p className="mt-1">Short challenges and bounties with XP and leaderboard rankings alongside live events.</p>
    </div>
  </div>
);

export const contactContent = (
  <p>
    Reach us at <a href="mailto:hello@techastra.local" className="underline">hello@techastra.local</a> for partnerships,
    campus programs, or organizer support.
  </p>
);

export const servicesContent = (
  <ul className="list-disc pl-5 space-y-2">
    <li>End-to-end hackathon operations (registration, teams, judging)</li>
    <li>MailerHub campaigns for reminders and certificates</li>
    <li>Job board and community chapters for your developer ecosystem</li>
  </ul>
);

import { PageHeader } from "@/components/shared/PageHeader"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Privacy Policy" subtitle="Last updated: 17 August 2026" backTo="/" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        This policy explains what information CampusReuse collects, why we collect it, and how it is
        handled. It applies to everyone who uses the service.
      </p>

      <Section title="1. Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information</strong> — name, email address, username, education level,
            program, and institution, which you provide at signup.
          </li>
          <li>
            <strong>Content you post</strong> — listings, photos, wanted posts, messages, and exchange
            proposals.
          </li>
          <li>
            <strong>Activity data</strong> — items you view, save, or interact with, so we can show
            you relevant material and detect abuse.
          </li>
          <li>
            <strong>Technical data</strong> — basic usage and error data needed to keep the service
            working and secure.
          </li>
        </ul>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>To run the marketplace: display listings, deliver messages and notifications, and match exchanges.</li>
          <li>To keep the community safe: detect scams, spam, and rule violations, and process reports and blocks.</li>
          <li>To improve the service and fix technical problems.</li>
          <li>To contact you about your account when necessary (for example, password resets).</li>
        </ul>
      </Section>

      <Section title="3. What we don't do">
        <ul className="list-disc space-y-1 pl-5">
          <li>We do not sell, rent, or trade your personal information to anyone.</li>
          <li>We do not show you third-party advertising.</li>
          <li>We do not use your data for anything beyond running and improving CampusReuse.</li>
        </ul>
      </Section>

      <Section title="4. What's visible to others">
        <p>
          Your username, institution, education level, and the listings you post are visible to other
          users — that's how the marketplace works. Your email address is never shown publicly.
          Messages between users are visible only to the participants (and to moderators only when
          investigating a reported issue).
        </p>
      </Section>

      <Section title="5. How we store your data">
        <p>
          Your data is stored securely on cloud infrastructure operated by Supabase, located in
          Frankfurt, Germany. Access is protected by authentication, row-level security, and strict
          administrative controls. Communications between your device and our servers are encrypted.
        </p>
      </Section>

      <Section title="6. Retention">
        <p>
          We keep your account and content while your account is active. If you delete your account,
          your profile and personal listings are removed. Copies may remain in backups for a limited
          period for disaster-recovery purposes.
        </p>
      </Section>

      <Section title="7. Your rights">
        <ul className="list-disc space-y-1 pl-5">
          <li>Access and correct your profile information from Settings.</li>
          <li>Block users who contact you, and unblock them at any time.</li>
          <li>Delete your account and data at any time from Settings.</li>
          <li>Ask us questions about how your data is handled — contact us below.</li>
        </ul>
      </Section>

      <Section title="8. Children's privacy">
        <p>
          CampusReuse is intended for students. Accounts for children under 13 are not permitted, and
          we do not knowingly collect their personal information. If you believe a child under 13 has
          created an account, contact us and we will remove it.
        </p>
      </Section>

      <Section title="9. Changes to this policy">
        <p>
          If we change how we handle personal information, we will update this page and announce
          material changes on the platform before they take effect.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions or concerns about this policy can be raised through the in-app report flow or
          sent to the campus moderation team by email at{" "}
          <a href="mailto:campusreuse@gmail.com" className="font-medium text-primary hover:underline">
            campusreuse@gmail.com
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
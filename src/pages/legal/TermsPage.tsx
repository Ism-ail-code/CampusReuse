import { PageHeader } from "@/components/shared/PageHeader"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="Terms of Service" subtitle="Last updated: 17 August 2026" backTo="/" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        Welcome to CampusReuse. By creating an account or using this service, you agree to these
        terms. Please read them carefully.
      </p>

      <Section title="1. What CampusReuse is">
        <p>
          CampusReuse is a student-run marketplace that connects students so they can sell, exchange,
          or give away academic materials such as textbooks, notes, and study resources. CampusReuse
          only facilitates connections — it does not handle payments, deliveries, or the transfer of
          items. You and the other party arrange all of that directly.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be a student, teacher, or staff member of a listed educational institution to use
          CampusReuse. If you are under 13, you may not create an account. If you are under 18, we
          strongly encourage you to involve a parent or guardian and to meet other users in public or
          school-approved places.
        </p>
      </Section>

      <Section title="3. Your account">
        <p>
          You are responsible for keeping your login details safe and for all activity under your
          account. You must provide accurate information when signing up. One person, one account —
          creating multiple accounts to bypass limits or bans is not allowed.
        </p>
      </Section>

      <Section title="4. Listing rules">
        <ul className="list-disc space-y-1 pl-5">
          <li>Only list physical academic materials you are allowed to sell, exchange, or give away.</li>
          <li>Describe items honestly — condition, edition, and any damage or markings.</li>
          <li>Do not list illegal, counterfeit, or prohibited items, including pirated digital content.</li>
          <li>Prices are in Pakistani Rupees and agreed entirely between you and the buyer.</li>
          <li>Do not post contact details in listings; keep communication on the platform.</li>
        </ul>
      </Section>

      <Section title="5. Prohibited behaviour">
        <ul className="list-disc space-y-1 pl-5">
          <li>Harassment, abuse, threats, hate speech, or discrimination of any kind.</li>
          <li>Scams, fraud, misleading listings, or asking for payment before meeting in person.</li>
          <li>Posting others' personal information without consent.</li>
          <li>Circumventing blocks, reports, or moderation actions.</li>
        </ul>
        <p>
          We may remove listings, suspend, or permanently ban accounts that violate these rules.
          Serious violations may be reported to the relevant authorities.
        </p>
      </Section>

      <Section title="6. User-generated content">
        <p>
          You keep ownership of the listings, photos, and messages you post, and you grant CampusReuse
          a limited licence to display them so the service can function. You confirm that your content
          does not violate anyone's rights.
        </p>
      </Section>

      <Section title="7. Your interactions">
        <p>
          All deals are between you and the other user. CampusReuse is not a party to any transaction
          and is not responsible for the condition of items, the conduct of users, or anything that
          happens when you meet. Meet in safe, public places and involve a trusted adult when
          appropriate.
        </p>
      </Section>

      <Section title="8. Disclaimers and liability">
        <p>
          CampusReuse is provided "as is" without warranties of any kind. To the maximum extent
          permitted by law, CampusReuse and its operators are not liable for indirect, incidental, or
          consequential damages arising from your use of the service or from any exchange arranged
          through it.
        </p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>
          We may update these terms from time to time. Material changes will be announced on the
          platform. Continued use of the service after changes take effect means you accept the
          updated terms.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Questions about these terms? Contact the campus moderation team from the in-app report
          flow or reach out through the contact address shown on the Privacy Policy page.
        </p>
      </Section>
    </div>
  )
}
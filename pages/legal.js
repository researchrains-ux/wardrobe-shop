import { useRouter } from 'next/router';
import styles from '../styles/Legal.module.css';

export default function Legal() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <button className={styles.back} onClick={() => router.back()}>← Back</button>
        <span className={styles.navBrand}>Leftover Wardrobe</span>
        <span />
      </nav>

      <div className={styles.container}>

        {/* Impressum */}
        <div className={styles.section}>
          <h1 className={styles.sectionTitle}>Impressum</h1>
          <p className={styles.note}>Angaben gemäß § 5 TMG / Information according to § 5 TMG</p>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Verantwortlich / Responsible</div>
            <p>Atharva Nioding</p>
            <p>Wilhelmstrasse 12</p>
            <p>97421 Schweinfurt</p>
            <p>Germany</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Kontakt / Contact</div>
            <p>E-Mail: <a href="mailto:niodingatharva@gmail.com" className={styles.link}>niodingatharva@gmail.com</a></p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Hinweis / Note</div>
            <p>This website is operated by a private individual (Privatperson) and not a commercial business. No VAT ID (Umsatzsteuer-ID) applies.</p>
          </div>
        </div>

        {/* Kaufbedingungen */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Kaufbedingungen / Terms of Sale</h2>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Privatverkauf / Private Sale</div>
            <p>All items are sold by a private individual. As a private seller, I am exempt from commercial warranty obligations under German law (§ 474 BGB). Items are sold as described and as seen.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Rückgabe / Returns</div>
            <p>As this is a private sale, there is no statutory right of withdrawal (Widerrufsrecht) under § 312g Abs. 2 Nr. 1 BGB. All sales are final. Please review item descriptions and photos carefully before purchasing.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Zahlung / Payment</div>
            <p>Payment is accepted by card via Stripe or cash on pickup/delivery. Card payments are processed securely. Cash payments are due at the time of pickup or delivery in Schweinfurt.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Abholung & Lieferung / Pickup & Delivery</div>
            <p>Pickup is available at Wilhelmstrasse 8, 97421 Schweinfurt during advertised time slots. Delivery is available within Schweinfurt city only for a flat fee of €1.00.</p>
          </div>
        </div>

        {/* Datenschutz */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Datenschutzerklärung / Privacy Policy</h2>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Verantwortlicher / Controller</div>
            <p>Atharva Nioding, Wilhelmstrasse 12, 97421 Schweinfurt — niodingatharva@gmail.com</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Welche Daten wir erheben / What data we collect</div>
            <p>When you place an order, we collect your name, email address or phone number, and delivery address if applicable. This data is used solely to process and fulfil your order.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Weitergabe an Dritte / Third parties</div>
            <p>Your payment data is processed by Stripe, Inc. in accordance with their privacy policy. Order data is stored securely via Supabase. We do not sell or share your data with any other third parties.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Cookies</div>
            <p>This website uses only essential cookies required for checkout functionality. No tracking, advertising, or analytics cookies are used.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Ihre Rechte / Your rights</div>
            <p>Under GDPR you have the right to access, correct, or delete your personal data at any time. Contact us at niodingatharva@gmail.com to exercise these rights.</p>
          </div>

          <div className={styles.block}>
            <div className={styles.blockTitle}>Datenlöschung / Data retention</div>
            <p>Order data is retained for a maximum of 12 months after the order date and then deleted.</p>
          </div>
        </div>

      </div>

      <div className={styles.footer}>
        <button className={styles.back} onClick={() => router.back()}>← Back to shop</button>
      </div>
    </div>
  );
}

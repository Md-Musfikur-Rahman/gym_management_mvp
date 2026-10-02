import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  QrCode,
  ScanLine,
  UsersRound,
} from "lucide-react";
import { LandingHeader } from "./landing-header";
import { ProductScreenshot } from "./product-screenshot";
import { ProductTour } from "./product-tour";
import styles from "@/app/landing.module.css";

const demoUrl = "https://gym-management-musfikur.vercel.app/login";

const questions = [
  {
    question: "What can I manage with Northline?",
    answer: "Northline brings member records, membership plans, payments, attendance, trainers, workout plans, and reports into one system. Owners, trainers, and members each have a workspace built around their day-to-day needs.",
  },
  {
    question: "Can I explore the product before getting started?",
    answer: "Yes. The product tour above shows real screens from the working MVP. Select Explore live demo to open the live application’s sign-in page. You’ll need a gym account to access an authenticated workspace.",
  },
  {
    question: "How does QR check-in work?",
    answer: "A linked member opens their personal QR code from the member workspace and shows it at reception. Reception scans the code to record attendance. The code contains the member code, and membership access is managed by the gym.",
  },
  {
    question: "Do trainers and members get their own accounts?",
    answer: "Yes. Trainers can view their assigned members and create workout plans. Linked members can view their membership, training, visits, payment history, and check-in QR. Each role has its own workspace.",
  },
  {
    question: "Does signing up create a new gym?",
    answer: <>Registration creates a member account. Your gym manages membership plans, profile linking, and access separately. Already a member? <Link href="/signup">Create your member account</Link> or <Link href="/login">sign in</Link>.</>,
  },
];

export function LandingPage() {
  return (
    <div className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <LandingHeader />

      <main id="main-content">
        <section className={`${styles.hero} ${styles.container}`} aria-labelledby="hero-heading">
          <div className={styles.heroIntro}>
            <div>
              <p className={styles.heroEyebrow}><span /> GYM MANAGEMENT, IN GOOD SHAPE</p>
              <h1 id="hero-heading">Less admin.<br />More <em>momentum.</em></h1>
            </div>
            <div className={styles.heroCopy}>
              <p>Your energy belongs on the gym floor. Bring members, payments, check-ins, and training together with Northline.</p>
              <a href={demoUrl} className={`${styles.button} ${styles.buttonDark}`}>
                Explore live demo <ArrowUpRight size={19} aria-hidden="true" />
              </a>
              <a href="#platform" className={styles.heroSecondary}>See how it works <ArrowDown size={15} aria-hidden="true" /></a>
              <small className={styles.demoNote}>Live MVP · Gym account required</small>
            </div>
          </div>

          <div className={styles.heroProduct}>
            <div className={styles.heroProductTop}>
              <span><span className={styles.smallPulse} /><span>YOUR GYM. ONE CLEAR VIEW.</span></span>
              <span className={styles.heroPreviewLabel}>A LOOK INSIDE NORTHLINE <ArrowDown size={14} aria-hidden="true" /></span>
            </div>
            <div className={styles.heroWindow}>
              <div className={styles.previewBar} aria-hidden="true">
                <span className={styles.windowDots}><i /><i /><i /></span>
                <span>northline / overview</span>
                <LayoutDashboard size={13} />
              </div>
              <ProductScreenshot
                src="/admin.png"
                alt="Northline gym management dashboard with member counts, active memberships, check-ins, monthly revenue, recently added members, and attendance."
                priority
                className={styles.heroScreenshot}
              />
            </div>
            <div className={styles.heroProductBottom}>
              <span><Activity size={15} aria-hidden="true" /> Built around your daily operations.</span>
              <span>Admin · Trainer · Member</span>
            </div>
          </div>
          <div className={styles.capabilities} aria-label="Platform capabilities">
            <span><UsersRound size={19} aria-hidden="true" /> Member management</span>
            <span><CreditCard size={19} aria-hidden="true" /> Memberships & payments</span>
            <span><QrCode size={19} aria-hidden="true" /> QR check-ins</span>
            <span><Dumbbell size={19} aria-hidden="true" /> Workout planning</span>
            <span><ChartNoAxesCombined size={19} aria-hidden="true" /> Clear reporting</span>
          </div>
        </section>

        <section className={`${styles.platformSection} ${styles.container}`} id="platform" aria-labelledby="platform-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>ONE PLATFORM. EVERY PERSPECTIVE.</p>
              <h2 id="platform-heading">A better day for<br />everyone in your gym.</h2>
            </div>
            <p className={styles.sectionDescription}>A clear overview for owners. A focused workspace for trainers. A connected experience for members. It all works together.</p>
          </div>
          <ProductTour />
        </section>

        <section className={styles.checkInSection} id="check-in" aria-labelledby="check-in-heading">
          <div className={`${styles.container} ${styles.checkInInner}`}>
            <div className={styles.checkInVisual}>
              <div className={styles.orbitOne} aria-hidden="true" />
              <div className={styles.orbitTwo} aria-hidden="true" />
              <div className={styles.scanLabel}><ScanLine size={19} aria-hidden="true" /> LESS FRICTION AT THE FRONT DESK</div>
              <div className={styles.qrCard}>
                <Image
                  src="/member-qr.png"
                  width={2940}
                  height={1912}
                  alt="A Northline member’s personal QR check-in card, ready to show at reception."
                  sizes="(max-width: 700px) 1100px, 1200px"
                  className={styles.qrScreenshot}
                />
              </div>
              <div className={styles.qrCaption}><span className={styles.qrCaptionIcon}><Check size={18} aria-hidden="true" /></span><span>Walk in. Check in.<br /><strong>Get moving.</strong></span><ArrowUpRight size={20} aria-hidden="true" /></div>
            </div>
            <div className={styles.checkInCopy}>
              <p className={styles.eyebrow}>A STRONGER FIRST IMPRESSION</p>
              <h2 id="check-in-heading">Good workouts<br />start with a<br /><em>smooth check-in.</em></h2>
              <p className={styles.bodyCopy}>Keep the front desk moving with a personal QR code for every linked member. Less searching through records. More time welcoming people in.</p>
              <ol className={styles.checkInSteps}>
                <li><span>01</span><div><h3>Open the member QR</h3><p>One place for their membership and check-in code.</p></div></li>
                <li><span>02</span><div><h3>Scan at reception</h3><p>Find the member and record their visit.</p></div></li>
                <li><span>03</span><div><h3>Keep everyone in the loop</h3><p>Attendance appears in the gym and member workspaces.</p></div></li>
              </ol>
              <a href={demoUrl} className={styles.textLink}>Take a look inside <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className={`${styles.operationsSection} ${styles.container}`} aria-labelledby="operations-heading">
          <div className={styles.operationsIntro}>
            <p className={styles.eyebrow}>LESS TO JUGGLE. MORE TO BUILD.</p>
            <h2 id="operations-heading">The behind-the-scenes<br />that moves you forward.</h2>
          </div>
          <div className={styles.benefitGrid}>
            <article className={styles.benefit}>
              <span className={styles.benefitNumber}>01 / STAY ORGANIZED</span>
              <div className={styles.benefitIllustration} aria-hidden="true">
                <span className={styles.memberAvatar}>JD</span><span className={styles.memberLines}><i /><i /></span><span className={styles.activePill}><span /> Active member</span>
              </div>
              <h3>Know your members.<br />Beyond their names.</h3>
              <p>Keep member profiles, plan details, and membership status connected, so your team always has the context.</p>
            </article>
            <article className={styles.benefit}>
              <span className={styles.benefitNumber}>02 / KEEP TRACK</span>
              <div className={`${styles.benefitIllustration} ${styles.paymentIllustration}`} aria-hidden="true">
                <span className={styles.paymentIcon}><CreditCard size={21} /></span><span className={styles.paymentLines}><strong>Payment recorded</strong><span>Connected to the member</span></span><span className={styles.paymentCheck}><Check size={16} /></span>
              </div>
              <h3>A clearer picture<br />of every payment.</h3>
              <p>Record payments, review member payment history, and see your revenue overview without switching tools.</p>
            </article>
            <article className={styles.benefit}>
              <span className={styles.benefitNumber}>03 / BUILD CONNECTION</span>
              <div className={`${styles.benefitIllustration} ${styles.trainingIllustration}`} aria-hidden="true">
                <span className={styles.trainingIcon}><Dumbbell size={21} /></span><span className={styles.trainingLine} /><span className={styles.trainingCenter}><Activity size={20} /></span><span className={styles.trainingLine} /><span className={styles.trainingIcon}><UsersRound size={21} /></span>
              </div>
              <h3>Bring your team<br />and members together.</h3>
              <p>Connect trainers to their members and keep assigned workouts in the same system as everyday gym operations.</p>
            </article>
          </div>
        </section>

        <section className={`${styles.faqSection} ${styles.container}`} id="questions" aria-labelledby="faq-heading">
          <div className={styles.faqIntro}>
            <p className={styles.eyebrow}>A LITTLE MORE CLARITY</p>
            <h2 id="faq-heading">Good questions.<br />Straight answers.</h2>
            <p>Get to know the platform before you step inside.</p>
            <a href={demoUrl} className={styles.textLink}>Explore the live application <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <div className={styles.faqList}>
            {questions.map((item, index) => (
              <details key={item.question} className={styles.faqItem} open={index === 0}>
                <summary>{item.question}<ChevronDown size={19} aria-hidden="true" /></summary>
                <div className={styles.faqAnswer}>{item.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="cta-heading">
          <div className={`${styles.container} ${styles.finalCtaInner}`}>
            <p className={styles.eyebrow}><span className={styles.smallPulse} /> BUILT TO KEEP YOUR GYM MOVING</p>
            <h2 id="cta-heading">Put your energy<br />where it <em>belongs.</em></h2>
            <p>Your members. Your team. Your gym.<br />Discover a simpler way to bring it all together.</p>
            <div className={styles.ctaActions}>
              <a href={demoUrl} className={`${styles.button} ${styles.buttonLime}`}>Explore live demo <ArrowUpRight size={20} aria-hidden="true" /></a>
              <Link href="/login" className={styles.ctaSignIn}>Already with Northline? Sign in <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <div className={styles.ctaOrbit} aria-hidden="true"><Activity /></div>
          </div>
        </section>
      </main>

      <footer className={`${styles.footer} ${styles.container}`}>
        <div className={styles.footerTop}>
          <div>
            <Link className={styles.brand} href="/" aria-label="Northline home"><span className={styles.brandMark}><Activity size={25} strokeWidth={2.4} aria-hidden="true" /></span><span>northline<span className={styles.brandPeriod}>.</span></span></Link>
            <p>A stronger rhythm for your gym.</p>
          </div>
          <nav aria-label="Footer navigation"><a href="#platform">The platform</a><a href="#questions">FAQs</a><Link href="/signup">Create a member account <ArrowUpRight size={14} aria-hidden="true" /></Link></nav>
        </div>
        <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Northline. All rights reserved.</span><span>Built for the people who keep us moving.<Activity size={15} aria-hidden="true" /></span></div>
      </footer>
    </div>
  );
}

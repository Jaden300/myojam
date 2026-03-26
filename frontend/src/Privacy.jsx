import Navbar from "./Navbar"
import Footer from "./Footer"

export default function Privacy() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "100px 32px 40px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 48 }}>
          Last updated: March 2025
        </p>

        {[
          {
            title: "1. Overview",
            body: "myojam is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding that information."
          },
          {
            title: "2. Information We Do Not Collect",
            body: "myojam does not collect, store, or transmit any personal data, biometric data, or EMG signal data. All signal processing occurs locally in your browser or on your device. No data is sent to any server other than requests necessary to run the gesture classification demo."
          },
          {
            title: "3. Demo API Requests",
            body: "When using the web demo in Dataset mode, your browser sends HTTP requests to our classification API (hosted on Render). These requests contain only anonymous EMG signal windows from the Ninapro DB5 dataset — not your personal EMG data. We do not log or store these requests beyond standard server access logs."
          },
          {
            title: "4. Sensor Mode",
            body: "When using Sensor mode in the web demo or desktop application, all EMG signal data from your body is processed entirely on your local device. No biometric data is transmitted externally under any circumstances."
          },
          {
            title: "5. Cookies and Analytics",
            body: "myojam does not use cookies, tracking pixels, or third-party analytics services. We do not track your behavior on this website."
          },
          {
            title: "6. Third-Party Services",
            body: "The website is hosted on Vercel and the API on Render. These services may collect standard server access logs (IP address, request time, user agent) as part of their normal operation. Please refer to Vercel's and Render's respective privacy policies for details."
          },
          {
            title: "7. Children's Privacy",
            body: "myojam is not directed at children under 13. We do not knowingly collect any information from children."
          },
          {
            title: "8. Changes to This Policy",
            body: "We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date."
          },
          {
            title: "9. Contact",
            body: "If you have questions about this Privacy Policy, please reach out through the Contact page."
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
              {section.title}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300 }}>
              {section.body}
            </p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  )
}
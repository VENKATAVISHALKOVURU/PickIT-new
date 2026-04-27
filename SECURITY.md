# Security Policy

## 🛡️ Our Commitment
At PickIT, the security of student data and shop owner financial records is our top priority. We operate under the **Garrison 360 Framework**, a defense-in-depth strategy designed to neutralize threats before they reach the data core.

## ⚔️ Defense Framework
1. **Perimeter Hardening**: We use `Helmet` for secure headers and strict Rate Limiting to prevent brute-force attacks.
2. **Logic Integrity**: All data access is strictly gated by identity ownership checks (IDOR protection).
3. **Vault Security**: Database files are locked down using OS-level Access Control Lists (ACLs).
4. **Dependency Audit**: We perform weekly deep-scans of our supply chain to prevent dependency poisoning.

## 🐛 Reporting a Vulnerability
If you discover a security vulnerability within PickIT, please send an email to **security@pickit.app**. 

Please include:
- A detailed description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact assessment.

We ask that you do not disclose the vulnerability publicly until we have had a chance to remediate it. We aim to respond to all security reports within 24 hours.

## 🏅 Security Researchers
We appreciate the efforts of the security community. While we do not currently have a formal bug bounty program, we are happy to acknowledge contributors in our "Hall of Fame" for significant findings.

---

**Req · Ready · Retrieve**

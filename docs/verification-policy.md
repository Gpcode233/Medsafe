# Identity and role assurance

Role selection is a claim, not authorization. A user receives capabilities only
through a verified, time-bounded role entitlement.

## Assurance layers

1. Account: verified email and phone, strong password or federation, MFA.
2. Person: government identity match, selfie liveness, name/date-of-birth match.
3. Professional: license number, regulator, profession, status, sanctions, and
   renewal date checked against an authoritative registry or regulator review.
4. Organization: CAC/legal entity, beneficial or authorized representative, and
   domain/contact control.
5. Premises: facility address, GPS, operating license, and role-specific premises
   approval.
6. Evidence: certificates and licenses stored as encrypted S3 objects with hash,
   malware scan, OCR comparison, provenance, and retention controls.
7. Review: separation of duties, reviewer reason, immutable audit event, and
   escalation for mismatches.
8. Lifecycle: expiry reminders, periodic re-checks, suspension, revocation, and
   immediate capability removal.

## Role-specific requirements

| Claimed role | Required authoritative evidence |
| --- | --- |
| Regulator | Invitation from an allow-listed government domain, agency roster match, agency administrator approval, MFA |
| Manufacturer/importer | CAC entity, NAFDAC establishment/product permissions, authorized representative, verified facility |
| Pharmacist | PCN practitioner status, annual license, employing pharmacy, premises registration, identity/liveness |
| Doctor | MDCN practitioner status, current annual practising license, facility relationship, identity/liveness |
| Nurse/midwife | Nursing and Midwifery Council status, current license, facility relationship |
| Pharmacy/premises | PCN premises registration, superintendent pharmacist link, CAC entity, inspected address |
| Patent medicine vendor | Applicable PCN/PPMV authorization, premises and identity checks, restricted product capabilities |
| Distributor/warehouse | CAC entity, applicable regulator permits, premises/warehouse verification, responsible professional |

## Document handling

A picture of a certificate is supporting evidence only. It can be forged, expired,
borrowed, or altered. The system must compare extracted fields with registry data
and organization records, retain a content hash, and route uncertainty to a human
reviewer. Original evidence is private to authorized reviewers and never exposed
in ordinary operational views.

## Access behavior

- Pending users can complete onboarding and view claim status only.
- Verified entitlements grant explicit capabilities, not broad role checks.
- Controlled-drug capabilities require additional NDLEA/organizational permits.
- High-risk actions require step-up MFA and may require dual approval.
- Expired, revoked, or suspended claims immediately deny protected operations.

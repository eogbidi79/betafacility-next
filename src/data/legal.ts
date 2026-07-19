// Central source of the legal/contract copy used in the tenancy agreement and
// short-let invoice. Review with counsel before production use.

export const INFLATION_CLAUSE = {
  heading: "Rent Review / Inflation Adjustment",
  body:
    "The Tenant acknowledges and agrees that BetaFacility Managers Limited may review and increase " +
    "the rent, service charge and associated fees on renewal, or during the term where permitted by law, " +
    "to match or reflect the prevailing rate of inflation and cost of living in Nigeria (as published by " +
    "the National Bureau of Statistics or a comparable index). Any such adjustment will be communicated " +
    "in writing with no less than sixty (60) days' notice before it takes effect. Continued occupation of " +
    "the property after the effective date constitutes acceptance of the reviewed rent and fees.",
};

export const TENANCY_CLAUSES: { title: string; body: string }[] = [
  {
    title: "1. Term",
    body:
      "This Agreement is for a fixed term of twelve (12) months commencing on the start date stated below. " +
      "Renewal is by mutual agreement and subject to the rent review clause herein.",
  },
  {
    title: "2. Rent & Fees",
    body:
      "The Tenant shall pay the annual rent stated below in full prior to occupation, together with any " +
      "applicable service charge, caution/security deposit and statutory fees. The caution deposit is " +
      "refundable at the end of the term less the cost of repairing any damage beyond fair wear and tear.",
  },
  {
    title: "3. Use of the Property",
    body:
      "The property shall be used solely as a private residence. The Tenant shall not use the property for " +
      "any illegal, immoral or commercial purpose, nor sublet or assign it without the prior written consent " +
      "of BetaFacility Managers Limited.",
  },
  {
    title: "4. Maintenance & Condition",
    body:
      "The Tenant shall keep the property clean and in good condition, promptly report faults through the " +
      "BetaFacility facility-management channel, and allow the Manager reasonable access for inspection and " +
      "repairs on prior notice (except in emergencies).",
  },
  {
    title: "5. Utilities & Compliance",
    body:
      "The Tenant is responsible for utility charges (electricity, water, refuse, internet where applicable) " +
      "and shall comply with estate rules, safety regulations and lawful directives of the relevant authorities.",
  },
  {
    title: "6. Alterations",
    body:
      "No structural alteration, painting or fixture change shall be made without prior written consent. " +
      "Approved alterations become part of the property unless otherwise agreed in writing.",
  },
  {
    title: "7. Termination & Default",
    body:
      "Either party may terminate at the end of the term on sixty (60) days' written notice. The Manager may " +
      "terminate for breach (including non-payment) after reasonable notice to remedy. On termination the " +
      "Tenant shall vacate and hand over the property and all keys in good condition.",
  },
];

export const TENANCY_DOS = [
  "Keep the property clean, safe and in good repair.",
  "Pay rent, service charge and utilities on time.",
  "Report faults and damage promptly via the facility-management channel.",
  "Respect neighbours, estate rules and quiet hours.",
  "Dispose of refuse properly and keep common areas clear.",
  "Allow inspections and repairs on reasonable prior notice.",
];

export const TENANCY_DONTS = [
  "Do not sublet, assign or run a business from the property without written consent.",
  "Do not carry out structural alterations or repainting without approval.",
  "Do not engage in illegal, hazardous or anti-social activities.",
  "Do not keep prohibited pets or store dangerous/flammable materials.",
  "Do not tamper with electrical, plumbing, solar or security installations.",
  "Do not cause nuisance, excessive noise or damage to the property or estate.",
];

export const SHORTLET_TERMS: { title: string; body: string }[] = [
  {
    title: "1. Booking & Payment",
    body:
      "The booking is confirmed only after full online payment for the number of nights reserved. Check-in " +
      "and check-out times and house rules will be shared on confirmation.",
  },
  {
    title: "2. Use of the Apartment",
    body:
      "The apartment is for the stated number of guests for short-stay accommodation only. Parties, events, " +
      "smoking indoors, illegal activities and unregistered guests are not permitted. Please treat the " +
      "apartment and its contents with care.",
  },
  {
    title: "3. Damage & Liability",
    body:
      "The guest is responsible for any loss or damage beyond fair wear and tear during the stay and " +
      "authorises BetaFacility Managers Limited to recover reasonable repair or replacement costs.",
  },
];

export const CANCELLATION_POLICY = {
  heading: "Cancellation, Refund & Voucher Policy",
  points: [
    "Cancellations made 48 hours or more before the check-in date are fully refundable.",
    "Cancellations made less than 48 hours before check-in are non-refundable.",
    "For non-refundable cancellations, the full amount is retained as a voucher which can be redeemed against a future stay.",
    "Vouchers are issued in the guest's name and remain valid for future bookings with BetaFacility Managers.",
    "No-shows are treated as a cancellation within 48 hours (voucher issued, non-refundable).",
  ],
};

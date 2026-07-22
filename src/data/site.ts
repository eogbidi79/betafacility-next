export const site = {
  name: "BetaFacility Managers",
  legalName: "BetaFacility Managers Limited",
  tagline: "Professional Property Management & Facility Services",
  description:
    "Professional Property Management & Facility Services. Your trusted partner in maximizing real estate value and operational efficiency.",
  url: "https://www.betafacility.com",
  phone: "+234 811 234 2092",
  phoneHref: "tel:+2348112342092",
  emails: {
    info: "info@betafacility.com",
    support: "support@betafacility.com",
  },
  address: {
    street: "Ogombo, Ajah",
    city: "Lagos",
    country: "Nigeria",
    full: "Ogombo, Ajah, Lagos, Nigeria",
  },
  hours: [
    { day: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { day: "Saturday", time: "9:00 AM – 2:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  // Authorised representative who counter-signs tenancy agreements.
  representative: {
    name: "Angela Okojie",
    title: "Property Manager",
    email: "angela.okojie@betafacility.com",
  },
  rcNumber: "RC 1234567",
  social: [
    { label: "Facebook", href: "#" },
    { label: "Twitter", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Rentals", href: "/rentals" },
  { label: "Listings", href: "/listings" },
  { label: "Agencies", href: "/agencies" },
  { label: "Services", href: "/property-services" },
  { label: "Manage My Property", href: "/property-management" },
  { label: "Facility", href: "/facility-management" },
  { label: "Advertise", href: "/advertise" },
  { label: "Portfolio", href: "/properties" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Rentals", href: "/rentals" },
  { label: "Agencies", href: "/agencies" },
  { label: "Property Services", href: "/property-services" },
  { label: "Property Management", href: "/property-management" },
  { label: "Facility Management", href: "/facility-management" },
  { label: "Advertise Property", href: "/advertise" },
  { label: "Portfolio", href: "/properties" },
  { label: "Contact Us", href: "/contact" },
] as const;

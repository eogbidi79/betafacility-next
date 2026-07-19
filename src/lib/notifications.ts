import type { Booking } from "@prisma/client";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";

function url(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}

function cta(label: string, path: string): string {
  return `<p style="margin-top:16px"><a href="${url(path)}" style="background:#ff751f;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">${label}</a></p>`;
}

const unit = (b: Booking) => b.propertyTitle ?? "your booking";

// ─── Long-term tenancy (prospect-facing) ──────────────────────────────

export async function notifyTenancyApplied(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `We've received your tenancy application — ${b.reference}`,
    html: emailLayout(
      "Application received",
      [
        ["Reference", b.reference],
        ["Property", unit(b)],
        ["Annual rent", formatNaira(b.amount)],
      ],
      `Thank you, ${b.guestName}. We've received your 1-year tenancy application. Our team will now carry ` +
        `out background checks and guarantor validation, and we'll email you with the outcome. No payment is ` +
        `required yet.`,
    ),
  });
}

export async function notifyTenancyUnderReview(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `Your tenancy application is under review — ${b.reference}`,
    html: emailLayout(
      "Application under review",
      [
        ["Reference", b.reference],
        ["Property", unit(b)],
      ],
      "Your application is now being reviewed — this includes background checks and validation of your " +
        "guarantor. We'll be in touch once the checks are complete.",
    ),
  });
}

export async function notifyTenancyAccepted(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `Good news — your tenancy application is accepted — ${b.reference}`,
    html: emailLayout(
      "Application accepted",
      [
        ["Reference", b.reference],
        ["Property", unit(b)],
        ["Annual rent", formatNaira(b.amount)],
      ],
      `Congratulations, ${b.guestName}! Your application passed our checks and has been accepted. ` +
        `Please complete payment of the annual rent to secure the property; you'll then review and e-sign ` +
        `your tenancy agreement.` + cta("Complete Payment", `/bookings/${b.reference}/checkout`),
    ),
  });
}

export async function notifyTenancyRejected(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `Update on your tenancy application — ${b.reference}`,
    html: emailLayout(
      "Application update",
      [["Reference", b.reference], ["Property", unit(b)]],
      "Thank you for your interest. Unfortunately we're unable to proceed with your application at this " +
        "time. Please contact us if you'd like more information or to discuss other available properties.",
    ),
  });
}

// ─── Payment / signing (prospect-facing) ──────────────────────────────

export async function notifyPaymentReceived(b: Booking) {
  const long = b.term === "long-term";
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.payments,
    subject: `Payment received — ${b.reference}`,
    html: emailLayout(
      "Payment received",
      [
        ["Reference", b.reference],
        [long ? "Property" : "Booking", long ? unit(b) : b.reference],
        ["Amount paid", formatNaira(b.amount)],
      ],
      (long
        ? "Thank you — your payment is confirmed. The final step is to review and e-sign your 1-year " +
          "tenancy agreement."
        : "Thank you — your payment is confirmed. Your invoice and receipt are ready.") +
        cta(
          long ? "Review & E-sign Agreement" : "View Invoice",
          long ? `/bookings/${b.reference}/agreement` : `/bookings/${b.reference}/invoice`,
        ) +
        `<p style="margin-top:8px"><a href="${url(`/bookings/${b.reference}/receipt`)}">View receipt</a></p>`,
    ),
  });
}

export async function notifyAgreementSigned(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `Your tenancy agreement is fully executed — ${b.reference}`,
    html: emailLayout(
      "Tenancy agreement executed",
      [
        ["Reference", b.reference],
        ["Property", unit(b)],
        ["Annual rent", formatNaira(b.amount)],
      ],
      "Your 1-year tenancy agreement has been signed by all parties. A copy and your receipt are available " +
        "in your account." + cta("View Agreement", `/bookings/${b.reference}/agreement`),
    ),
  });
}

// ─── Short-let (prospect-facing) ──────────────────────────────────────

export async function notifyShortBookingReceived(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.contact,
    subject: `Your booking request — ${b.reference}`,
    html: emailLayout(
      "Booking request received",
      [
        ["Reference", b.reference],
        ["Nights", String(b.nights)],
        ["Amount due", formatNaira(b.amount)],
      ],
      `Thanks, ${b.guestName}. We've received your short-stay booking request. Please complete payment to ` +
        `confirm your reservation; your invoice and terms will be issued immediately after payment.`,
    ),
  });
}

export async function notifyShortPaymentAccepted(b: Booking) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.payments,
    subject: `Payment accepted — your booking is confirmed — ${b.reference}`,
    html: emailLayout(
      "Booking confirmed",
      [
        ["Reference", b.reference],
        ["Nights", String(b.nights)],
        ["Amount paid", formatNaira(b.amount)],
      ],
      "Your payment has been accepted and your stay is confirmed. Your invoice includes the full terms & " +
        "conditions and our cancellation policy (fully refundable 48+ hours before check-in; within 48 " +
        "hours a reusable voucher is issued)." + cta("View Invoice & T&C", `/bookings/${b.reference}/invoice`),
    ),
  });
}

export async function notifyBookingCancelled(b: Booking, voucherCode: string | null) {
  await sendEmail({
    to: b.guestEmail,
    replyTo: notifyTo.payments,
    subject: `Your booking is cancelled — ${b.reference}`,
    html: emailLayout(
      "Booking cancelled",
      [
        ["Reference", b.reference],
        ["Outcome", b.refundOutcome ?? "cancelled"],
        ...(voucherCode ? ([["Voucher", voucherCode]] as [string, string][]) : []),
      ],
      voucherCode
        ? "Your booking is cancelled. As it was within 48 hours of check-in it's non-refundable, but we've " +
          "issued the full amount as a voucher you can redeem on a future stay."
        : "Your booking is cancelled and, as it was 48+ hours before check-in, is eligible for a full refund.",
    ),
  });
}

// ─── Staff copy (single helper for internal alerts) ───────────────────

export async function notifyStaff(subject: string, rows: [string, string][], to = [notifyTo.admin]) {
  await sendEmail({ to, subject, html: emailLayout(subject, rows) });
}

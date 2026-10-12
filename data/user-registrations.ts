import type { UserRegistration } from "@/lib/user-registrations/types";

/** Demo user until the authenticated user profile API is connected. */
export const userRegistrationsMockUser = {
  name: {
    en: "Jana Alshaikh",
    ar: "جنى الشيخ",
  },
};

/**
 * Presentation-only sample records for the registrations page.
 * Replace this dataset with the authenticated registrations API when its contract is published.
 */
export const userRegistrationsMock: UserRegistration[] = [
  {
    id: "mock-event-pending",
    kind: "event",
    title: "ورشة أساسيات تحليل البيانات | Data Analysis Fundamentals",
    startsAt: "2026-10-18T16:00:00+03:00",
    location: "مبنى كلية الحاسبات، جامعة جدة | College of Computing, University of Jeddah",
    status: "pending",
  },
  {
    // Awaiting the member's confirmation with a deadline still ahead (demo of Confirm/Cancel).
    id: "mock-event-devfest-confirmation",
    kind: "event",
    title: "ديف فست جامعة جدة 2026 | DevFest UJ 2026",
    startsAt: "2026-10-17T16:00:00+03:00",
    location: "المسرح الرئيسي، جامعة جدة | University of Jeddah - Main Auditorium",
    status: "need-confirmation",
    confirmationDeadline: "2026-10-15T23:59:00+03:00",
  },
  {
    id: "mock-trip-confirmation",
    kind: "trip",
    title: "زيارة تقنية إلى وادي جدة | Jeddah Valley Tech Visit",
    startsAt: "2026-10-12T09:00:00+03:00",
    location: "وادي جدة | Jeddah Valley",
    status: "need-confirmation",
    confirmationDeadline: "2026-10-05T23:59:00+03:00",
  },
  {
    id: "mock-event-approved",
    kind: "event",
    title: "لقاء مطوري الويب | Web Developers Meetup",
    startsAt: "2026-10-25T18:30:00+03:00",
    location: "مسرح الجامعة | University Auditorium",
    status: "approved",
    attendanceConfirmationStatus: "confirmed",
    attendanceConfirmedAt: "2026-10-02T13:20:00+03:00",
    checkInStatus: "not-checked-in",
  },
  {
    id: "mock-trip-declined",
    kind: "trip",
    title: "رحلة مركز الابتكار | Innovation Center Tour",
    startsAt: "2026-10-20T08:00:00+03:00",
    location: "مركز الابتكار، جدة | Innovation Center, Jeddah",
    status: "declined",
  },
  {
    id: "mock-event-attended",
    kind: "event",
    title: "مقدمة في تطوير تطبيقات Android | Intro to Android Development",
    startsAt: "2026-09-20T17:00:00+03:00",
    location: "معمل التقنية، جامعة جدة | Tech Lab, University of Jeddah",
    status: "attended",
  },
  {
    id: "mock-event-not-attended",
    kind: "event",
    title: "جلسة بناء واجهات باستخدام React | Building Interfaces with React",
    startsAt: "2026-09-12T16:30:00+03:00",
    location: "قاعة المؤتمرات | Conference Hall",
    status: "not-attended",
  },
];

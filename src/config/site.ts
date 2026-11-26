/**
 * Facts about the villa and the business. Everything set to `null` is waiting for the owner to confirm it: the page
 * shows a "CONFIRM" marker in its place (components/ui/Pending) until a value is filled in here.
 */
export const site = {
  name: 'Hikka Hills',
  tagline: 'A Private Escape Above the Ordinary.',
  place: 'Hikkaduwa · Sri Lanka',
  year: 2026,

  contact: {
    /** Shown as typed, e.g. "+94 77 123 4567". */
    phone: null as string | null,
    /** WhatsApp number in international form, digits only, e.g. "94771234567". */
    whatsapp: null as string | null,
    email: null as string | null,
    address: null as string | null,
    /** e.g. "within 24 hours". */
    responseTime: null as string | null,
  },

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  location: {
    region: 'Hikkaduwa, Sri Lanka',
    /**
     * Once the exact pin is confirmed, an embed address such as
     * "https://www.openstreetmap.org/export/embed.html?bbox=...&marker=lat,lng" replaces the drawn map.
     */
    mapEmbedUrl: null as string | null,
    /** A link that opens the pin in a maps app. */
    mapLink: null as string | null,
  },

  booking: {
    /** The most guests one enquiry may ask for, until the villa's real capacity is confirmed. */
    maxGuests: 12,
    /**
     * Where a finished enquiry goes: "api" posts it to the backend (backend/, Laravel), which emails the owner and a
     * copy to the guest; "whatsapp" opens WhatsApp with the enquiry typed out (needs contact.whatsapp); "email" opens
     * the visitor's mail app (needs contact.email). With "none" the form checks the details and says that enquiries
     * are not connected yet. See features/booking/lib/submitEnquiry.ts.
     */
    channel: 'api' as 'api' | 'whatsapp' | 'email' | 'none',
    /**
     * The backend's enquiry address. VITE_API_URL (in .env.local, or the host's build settings) is the backend's
     * address when it lives elsewhere, e.g. "https://api.hikkahills.lk"; left empty, the site calls its own /api,
     * which the dev server forwards to the backend (vite.config.ts).
     */
    endpoint: `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api/enquiries`,
  },
}

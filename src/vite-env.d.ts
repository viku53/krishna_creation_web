/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_COMING_SOON: string;
  readonly VITE_INSTANT_PRINTING_COMING_SOON: string;
  readonly VITE_ENABLE_EMAIL_NOTIFICATIONS: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_CONTACT_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_ORDER_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_EMAILJS_TO_EMAIL: string;
  readonly VITE_CONTACT_NUMBER: string;
  readonly VITE_GOOGLE_DRIVE_API_KEY: string;
  readonly VITE_GOOGLE_DRIVE_VIDEOS_FOLDER_ID: string;
  readonly VITE_GOOGLE_DRIVE_REELS_FOLDER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

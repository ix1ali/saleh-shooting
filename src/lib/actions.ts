import { contact, ui, type I18n } from "@/data/site";

export type IconName = "instagram" | "whatsapp" | "phone" | "pin";

export type Action = {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  external: boolean;
  primary: boolean;
};

/**
 * Builds the contact actions from whatever the facility has actually
 * published. The phone and WhatsApp numbers are null in the data file because
 * no public number is listed on the Instagram profile — so those buttons are
 * not rendered at all rather than shipped as dead links. Fill in
 * `contact.phone` / `contact.whatsapp` and they appear everywhere at once.
 */
export function buildActions(T: (v: I18n) => string): Action[] {
  const actions: Action[] = [];

  actions.push({
    id: "instagram",
    label: T(ui.message),
    href: contact.instagram,
    icon: "instagram",
    external: true,
    primary: contact.primaryChannel === "instagram",
  });

  if (contact.whatsapp) {
    actions.push({
      id: "whatsapp",
      label: T(ui.whatsapp),
      href: `https://wa.me/${contact.whatsapp}`,
      icon: "whatsapp",
      external: true,
      primary: contact.primaryChannel === "whatsapp",
    });
  }

  if (contact.phone) {
    actions.push({
      id: "call",
      label: T(ui.call),
      href: `tel:+${contact.phone}`,
      icon: "phone",
      external: false,
      primary: contact.primaryChannel === "phone",
    });
  }

  actions.push({
    id: "directions",
    label: T(ui.directions),
    href: contact.mapsUrl,
    icon: "pin",
    external: true,
    primary: false,
  });

  return actions;
}

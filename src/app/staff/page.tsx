import type { Metadata } from "next";
import StaffClient from "./StaffClient";

export const metadata: Metadata = {
  title: "Staff — Shooting Complex",
  /* Never indexed, never linked from public navigation. Access is enforced on
     the server for every request, not by the obscurity of this route. */
  robots: { index: false, follow: false, nocache: true },
};

export default function StaffPage() {
  return <StaffClient />;
}

import { redirect } from "next/navigation";

/** Hub opens the first published lesson (sidebar lists full curriculum). */
export default function SoftwareTestingGuideHubPage() {
  redirect("/guides/software-testing/introduction-to-software-testing");
}

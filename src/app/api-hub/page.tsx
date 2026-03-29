import { ApiHubCatalog } from "@/components/api-hub/api-hub-catalog";
import { ApiHubShell } from "@/components/api-hub/api-hub-shell";
import { CURATED_APIS } from "@/lib/api-hub-catalog";

export default function ApiHubPage() {
  return (
    <ApiHubShell>
      <ApiHubCatalog apis={CURATED_APIS} />
    </ApiHubShell>
  );
}

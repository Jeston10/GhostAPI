import type { Collection, Db } from "mongodb";

export const MOCK_ENDPOINTS_COLLECTION = "mock_endpoints";

export type MockEndpointMethod = "GET" | "POST";

export interface MockEndpointDoc {
  slug: string;
  method: MockEndpointMethod;
  requestFormat: string | null;
  responseFormat: string;
  createdAt: Date;
}

let indexesEnsured = false;

export async function ensureMockEndpointIndexes(db: Db): Promise<void> {
  if (indexesEnsured) return;
  await db
    .collection(MOCK_ENDPOINTS_COLLECTION)
    .createIndex({ slug: 1 }, { unique: true });
  indexesEnsured = true;
}

export function mockEndpointsColl(db: Db): Collection<MockEndpointDoc> {
  return db.collection<MockEndpointDoc>(MOCK_ENDPOINTS_COLLECTION);
}

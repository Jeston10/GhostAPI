import { getDb } from "@/lib/mongodb";
import type { TestState } from "@/app/api/tests/store";

const COLLECTION = "load_test_runs";

type StoredRun = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TestState["status"];
  config: TestState["config"];
  metrics: TestState["metrics"];
  startedAt?: number;
  endTime?: number;
  error?: string;
  thresholdSummary?: TestState["thresholdSummary"];
};

declare global {
  var __ghostApiLoadRunStore: Map<string, StoredRun> | undefined;
}

const localStore = globalThis.__ghostApiLoadRunStore ?? new Map<string, StoredRun>();
if (!globalThis.__ghostApiLoadRunStore) {
  globalThis.__ghostApiLoadRunStore = localStore;
}

export async function upsertRunResult(state: TestState) {
  const now = new Date().toISOString();
  const payload: StoredRun = {
    id: state.id,
    createdAt: now,
    updatedAt: now,
    status: state.status,
    config: state.config,
    metrics: state.metrics,
    startedAt: state.startedAt,
    endTime: state.endTime,
    error: state.error,
    thresholdSummary: state.thresholdSummary,
  };

  localStore.set(state.id, payload);
  await upsertMongo(payload);
}

export async function listRuns(limit = 20) {
  const mongoRuns = await tryListMongo(limit);
  if (mongoRuns) return mongoRuns;
  return [...localStore.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export async function getRun(runId: string) {
  const mongoRun = await tryGetMongo(runId);
  if (mongoRun) return mongoRun;
  return localStore.get(runId) ?? null;
}

async function upsertMongo(run: StoredRun) {
  try {
    const db = await getDb();
    const collection = db.collection<StoredRun>(COLLECTION);
    await collection.updateOne(
      { id: run.id },
      {
        $set: {
          ...run,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
  } catch {
    // Fallback to in-memory only.
  }
}

async function tryListMongo(limit: number) {
  try {
    const db = await getDb();
    const collection = db.collection<StoredRun>(COLLECTION);
    return await collection
      .find({})
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  } catch {
    return null;
  }
}

async function tryGetMongo(runId: string) {
  try {
    const db = await getDb();
    const collection = db.collection<StoredRun>(COLLECTION);
    return await collection.findOne({ id: runId });
  } catch {
    return null;
  }
}

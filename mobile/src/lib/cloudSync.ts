// Supabase 동기화 — 익명 세션 + 스냅 기록 push/pull.
// Supabase 미설정 시 모든 함수가 안전하게 no-op 한다 (앱은 로컬 전용으로 동작).
import { supabase } from "./supabase";
import type { ProofStampId, SnapRecord } from "../types/habit";

// 익명 세션을 보장한다. 로그인 화면 없이 첫 실행에 조용히 계정을 만든다.
// 돌려주는 값은 유저 id (없으면 null).
export async function ensureAnonymousSession(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: signedIn, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return signedIn.user?.id ?? null;
  } catch {
    return null;
  }
}

type SnapRow = {
  id: string;
  category: string;
  place_type: string | null;
  memo: string | null;
  filter: string | null;
  sticker: string | null;
  proof_stamps: ProofStampId[] | null;
  image_url: string | null;
  created_at: string;
};

function rowToRecord(row: SnapRow): SnapRecord {
  return {
    id: row.id,
    category: row.category as SnapRecord["category"],
    placeType: (row.place_type ?? "other") as SnapRecord["placeType"],
    memo: row.memo ?? undefined,
    filter: row.filter ?? undefined,
    sticker: row.sticker ?? undefined,
    proofStamps: Array.isArray(row.proof_stamps) ? row.proof_stamps : [],
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at
  };
}

function recordToRow(record: SnapRecord) {
  return {
    id: record.id,
    category: record.category,
    place_type: record.placeType,
    memo: record.memo ?? null,
    filter: record.filter ?? null,
    sticker: record.sticker ?? null,
    proof_stamps: record.proofStamps ?? [],
    image_url: record.imageUrl ?? null,
    created_at: record.createdAt
  };
}

// 서버에 저장된 내 스냅 기록을 모두 가져온다. 실패하면 null.
export async function pullSnapRecords(): Promise<SnapRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("snaps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return null;
    return (data as SnapRow[]).map(rowToRecord);
  } catch {
    return null;
  }
}

// 스냅 기록 한 건을 서버에 올린다 (있으면 갱신).
export async function pushSnapRecord(record: SnapRecord): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("snaps").upsert(recordToRow(record));
  } catch {
    // 실패는 다음 동기화에서 자연 재시도
  }
}

// 여러 스냅 기록을 한 번에 서버에 올린다.
export async function pushSnapRecords(records: SnapRecord[]): Promise<void> {
  if (!supabase || records.length === 0) return;
  try {
    await supabase.from("snaps").upsert(records.map(recordToRow));
  } catch {
    // 실패는 다음 동기화에서 자연 재시도
  }
}

# Formi — Supabase 백엔드 셋업

Formi 모바일 앱을 Supabase 와 연결해 스냅 기록을 클라우드에 동기화한다.
Supabase 를 설정하지 않으면 앱은 기존처럼 로컬(AsyncStorage) 전용으로 그대로 동작한다.

## 1단계 — Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트를 만든다 (무료 플랜으로 충분).
2. 프로젝트가 준비되면 **Project Settings → API** 에서 두 값을 복사해 둔다.
   - `Project URL`
   - `anon public` 키

## 2단계 — 익명 로그인 켜기

**Authentication → Sign In / Providers → Anonymous Sign-ins** 를 켠다.
Formi 는 로그인 화면 없이 첫 실행에 익명 계정을 만들어 데이터를 동기화한다.

## 3단계 — 테이블 + 보안 정책 만들기

**SQL Editor** 에 아래를 붙여 실행한다.

```sql
create table if not exists public.snaps (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null,
  place_type text,
  memo text,
  filter text,
  sticker text,
  proof_stamps jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null,
  synced_at timestamptz not null default now()
);

alter table public.snaps enable row level security;

create policy "own snaps - select" on public.snaps
  for select using (auth.uid() = user_id);
create policy "own snaps - insert" on public.snaps
  for insert with check (auth.uid() = user_id);
create policy "own snaps - update" on public.snaps
  for update using (auth.uid() = user_id);
create policy "own snaps - delete" on public.snaps
  for delete using (auth.uid() = user_id);
```

Row Level Security 로 각 사용자는 자기 기록만 읽고 쓸 수 있다.

## 4단계 — 앱에 키 넣기

`mobile/.env.example` 을 복사해 `mobile/.env` 를 만들고 1단계의 값을 채운다.

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

그다음 캐시를 비우고 다시 실행한다.

```
cd mobile && npx expo start -c
```

`EXPO_PUBLIC_` 로 시작하는 환경변수는 Expo 가 자동으로 읽어 클라이언트 번들에 넣는다.
anon 키는 공개돼도 안전하게 설계된 키이며, 실제 데이터 보호는 위의 RLS 정책이 한다.

## 동작 방식

- 첫 실행 — 익명 세션 생성, 서버에 있는 내 스냅 기록을 가져와 로컬과 병합.
- 스냅 저장 — 로컬에 저장하고 동시에 서버에 올림.
- 미설정 — `.env` 가 없으면 모든 동기화가 조용히 건너뛰어지고 앱은 로컬 전용으로 동작.

## 다음 단계 (아직 안 한 것)

- 스냅 **사진** 을 Supabase Storage 에 업로드 (지금은 메타데이터만 동기화, 사진은 기기 로컬).
- 익명 계정을 이메일 계정으로 **연동(link)** 해 기기 간 데이터 이동.
- 모임(Meet) 멤버·세션을 서버에 저장해 진짜 소셜 루프로 전환.
- 사용자 설정(Preferences)·방 레이아웃 동기화.

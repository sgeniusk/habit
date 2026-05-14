import type { SnapRecord } from "../types/habit";

export const initialRecords: SnapRecord[] = [
  {
    id: "sample-study-1",
    category: "study",
    placeType: "library",
    memo: "아침 문제풀이",
    createdAt: "2026-05-09T09:20:00.000+09:00"
  },
  {
    id: "sample-meal-1",
    category: "meal",
    placeType: "restaurant",
    memo: "가벼운 점심",
    createdAt: "2026-05-09T12:40:00.000+09:00"
  },
  {
    id: "sample-exercise-1",
    category: "exercise",
    placeType: "outdoors",
    memo: "20분 러닝",
    createdAt: "2026-05-10T21:15:00.000+09:00"
  },
  {
    id: "sample-study-2",
    category: "study",
    placeType: "library",
    memo: "도서관 2층",
    createdAt: "2026-05-11T09:35:00.000+09:00"
  },
  {
    id: "sample-reading-1",
    category: "reading",
    placeType: "cafe",
    memo: "책 18쪽",
    createdAt: "2026-05-12T18:10:00.000+09:00"
  },
  {
    id: "sample-selfcare-1",
    category: "selfcare",
    placeType: "home",
    memo: "잠들기 전 스트레칭",
    createdAt: "2026-05-12T22:20:00.000+09:00"
  }
];

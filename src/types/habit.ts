export type TabId = "today" | "snap" | "home" | "meet" | "report";

export type ProofStampId = "time" | "count" | "persona";

export type HabitCategory =
  | "study"
  | "meal"
  | "exercise"
  | "reading"
  | "cleaning"
  | "selfcare"
  | "hobby";

export type PlaceType =
  | "home"
  | "library"
  | "school"
  | "cafe"
  | "gym"
  | "restaurant"
  | "outdoors"
  | "other";

export type SnapRecord = {
  id: string;
  category: HabitCategory;
  placeType: PlaceType;
  createdAt: string;
  memo?: string;
  imageUrl?: string;
  filter?: string;
  sticker?: string;
  proofStamps?: ProofStampId[];
};

export type PersonaCard = {
  id: string;
  category: HabitCategory;
  name: string;
  activity: string;
  place: string;
  level: number;
  tone: "leaf" | "coral" | "blue";
  accessory: string;
  tags: string[];
  roomItem: string;
  outfit: string;
};

export type PersonaDecorSelection = {
  roomItem: string;
  outfit: string;
};

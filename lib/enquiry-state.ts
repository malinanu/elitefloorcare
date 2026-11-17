export type EnquiryField = "name" | "business" | "phone" | "email" | "location" | "facilityType" | "message";

export type EnquiryState =
  | { status: "idle" }
  | { status: "success"; ref: string }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<EnquiryField, string>>; values?: Partial<Record<EnquiryField, string>> };

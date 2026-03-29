export type CuratedApiAuth = "none" | "api_key";

export type CuratedApiEntry = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  auth: CuratedApiAuth;
  docsUrl?: string;
  defaultMethod: "GET" | "POST";
  exampleUrl: string;
  defaultBody?: string;
  defaultHeaders?: Record<string, string>;
  requestNotes: string;
  requestExample: string;
  responseExample: string;
  responseShape: string;
};

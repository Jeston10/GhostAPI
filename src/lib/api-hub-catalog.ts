/**
 * Curated free HTTPS APIs developers can try without accounts (rate limits may apply).
 * URLs are examples; users can edit query/body in the hub tester.
 */

import type { CuratedApiEntry } from "./api-hub-types";
import { API_HUB_BULK_ENTRIES } from "./api-hub-bulk-entries";
import { API_HUB_MORE_ENTRIES } from "./api-hub-more-entries";

export type { CuratedApiAuth, CuratedApiEntry } from "./api-hub-types";

const CURATED_APIS_CORE: CuratedApiEntry[] = [
  {
    slug: "open-meteo-weather",
    name: "Open-Meteo — current weather",
    category: "Weather",
    tagline: "Free weather data, no API key",
    description:
      "Open-source weather API with global coverage. Tune latitude/longitude and parameters for hourly or daily data.",
    auth: "none",
    docsUrl: "https://open-meteo.com/en/docs",
    defaultMethod: "GET",
    exampleUrl:
      "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true",
    requestNotes: "Use GET. Required query params include latitude and longitude in decimal degrees.",
    requestExample: "GET /v1/forecast?latitude=…&longitude=…&current_weather=true",
    responseExample: `{
  "latitude": 40.71,
  "longitude": -74.01,
  "current_weather": {
    "temperature": 12.3,
    "windspeed": 15.2,
    "weathercode": 2
  }
}`,
    responseShape:
      "{ latitude, longitude, current_weather: { temperature, windspeed, weathercode, … }, … }",
  },
  {
    slug: "open-meteo-geocoding",
    name: "Open-Meteo — geocoding",
    category: "Location",
    tagline: "Resolve city names to coordinates",
    description:
      "Search places by name and read latitude, longitude, timezone, and country for use with forecast APIs.",
    auth: "none",
    docsUrl: "https://open-meteo.com/en/docs/geocoding-api",
    defaultMethod: "GET",
    exampleUrl: "https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=3&language=en",
    requestNotes: "GET with name, optional count and language.",
    requestExample: "GET /v1/search?name=Berlin&count=3",
    responseExample: `{
  "results": [
    {
      "id": 2950159,
      "name": "Berlin",
      "latitude": 52.52,
      "longitude": 13.41,
      "country": "Germany"
    }
  ]
}`,
    responseShape: "{ results: [{ id, name, latitude, longitude, country, admin1, … }] }",
  },
  {
    slug: "rest-countries",
    name: "REST Countries",
    category: "Geography",
    tagline: "Country metadata as JSON",
    description:
      "Flags, capitals, regions, currencies, languages, and more. Filter fields to shrink payloads.",
    auth: "none",
    docsUrl: "https://restcountries.com/",
    defaultMethod: "GET",
    exampleUrl: "https://restcountries.com/v3.1/name/canada",
    requestNotes: "GET by name, code, region, or use /v3.1/all with optional field filters.",
    requestExample: "GET /v3.1/name/canada",
    responseExample: `[
  {
    "name": { "common": "Canada", "official": "Canada" },
    "cca2": "CA",
    "capital": ["Ottawa"],
    "region": "Americas"
  }
]`,
    responseShape: "Array of country objects with name, cca2, capital[], region, flags, …",
  },
  {
    slug: "frankfurter-rates",
    name: "Frankfurter — exchange rates",
    category: "Finance",
    tagline: "ECB-based FX, no key",
    description:
      "Latest and historical foreign exchange rates relative to a base currency (ECB data).",
    auth: "none",
    docsUrl: "https://www.frankfurter.app/docs/",
    defaultMethod: "GET",
    exampleUrl: "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY",
    requestNotes: "GET latest or historical with from, to, amount.",
    requestExample: "GET /latest?from=USD&to=EUR,GBP",
    responseExample: `{
  "amount": 1,
  "base": "USD",
  "date": "2024-01-15",
  "rates": { "EUR": 0.92, "GBP": 0.79, "JPY": 148.2 }
}`,
    responseShape: "{ amount, base, date, rates: { [currency]: number } }",
  },
  {
    slug: "ipify",
    name: "Ipify — public IP",
    category: "Dev utilities",
    tagline: "Quick JSON or text IP check",
    description:
      "Returns the caller’s public IP—useful for client diagnostics and geo pipelines.",
    auth: "none",
    docsUrl: "https://www.ipify.org/",
    defaultMethod: "GET",
    exampleUrl: "https://api.ipify.org?format=json",
    requestNotes: "GET with format=json for JSON; omit for plain text.",
    requestExample: "GET ?format=json",
    responseExample: `{ "ip": "203.0.113.42" }`,
    responseShape: "{ ip: string }",
  },
  {
    slug: "jsonplaceholder",
    name: "JSONPlaceholder — sample posts",
    category: "Dev & JSON",
    tagline: "Fake REST data for prototyping",
    description:
      "Typicode’s placeholder API for posts, users, albums—ideal for frontend mocks and tutorials.",
    auth: "none",
    docsUrl: "https://jsonplaceholder.typicode.com/",
    defaultMethod: "GET",
    exampleUrl: "https://jsonplaceholder.typicode.com/posts/1",
    requestNotes: "GET /posts/:id, /users, /albums, etc. POST/PATCH simulate writes (not persisted).",
    requestExample: "GET /posts/1",
    responseExample: `{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident…",
  "body": "quia et suscipit…"
}`,
    responseShape: "{ userId, id, title, body }",
  },
  {
    slug: "randomuser",
    name: "RandomUser.me",
    category: "Dev & JSON",
    tagline: "Random user personas",
    description:
      "Generate random users with names, photos, and addresses—handy for UI and form testing.",
    auth: "none",
    docsUrl: "https://randomuser.me/documentation",
    defaultMethod: "GET",
    exampleUrl: "https://randomuser.me/api/?nat=us,gb&results=2",
    requestNotes: "GET with results, nat, seed, gender, format=json.",
    requestExample: "GET /api/?results=3&nat=us",
    responseExample: `{
  "results": [
    {
      "gender": "female",
      "name": { "first": "Jane", "last": "Doe" },
      "email": "jane.doe@example.com",
      "location": { "city": "Austin", "country": "United States" }
    }
  ],
  "info": { "seed": "abc", "results": 1, "page": 1, "version": "1.4" }
}`,
    responseShape: "{ results: User[], info }",
  },
  {
    slug: "cat-facts",
    name: "Cat Facts",
    category: "Fun",
    tagline: "Random cat facts",
    description: "Lightweight JSON endpoint returning a random fact about cats.",
    auth: "none",
    defaultMethod: "GET",
    exampleUrl: "https://catfact.ninja/fact",
    requestNotes: "GET returns { fact, length }.",
    requestExample: "GET /fact",
    responseExample: `{ "fact": "Cats have whiskers on the back of their front legs.", "length": 58 }`,
    responseShape: "{ fact: string, length: number }",
  },
  {
    slug: "dog-ceo",
    name: "Dog CEO",
    category: "Fun",
    tagline: "Random dog images",
    description: "Returns a message URL for a random dog image—great for image placeholders.",
    auth: "none",
    docsUrl: "https://dog.ceo/dog-api/",
    defaultMethod: "GET",
    exampleUrl: "https://dog.ceo/api/breeds/image/random",
    requestNotes: "Many sub-routes under /api/breeds/… for breed lists and images.",
    requestExample: "GET /api/breeds/image/random",
    responseExample: `{
  "message": "https://images.dog.ceo/breeds/…",
  "status": "success"
}`,
    responseShape: "{ message: url string, status }",
  },
  {
    slug: "nationalize",
    name: "Nationalize.io",
    category: "Identity",
    tagline: "Predict nationality from a first name",
    description:
      "Returns probability scores for country codes given a name—useful for demos (not for sensitive decisions).",
    auth: "none",
    docsUrl: "https://nationalize.io/",
    defaultMethod: "GET",
    exampleUrl: "https://api.nationalize.io?name=alex",
    requestNotes: "GET with name= query; optional batch with multiple names.",
    requestExample: "GET ?name=sarah",
    responseExample: `{
  "name": "sarah",
  "country": [
    { "country_id": "US", "probability": 0.12 },
    { "country_id": "GB", "probability": 0.09 }
  ]
}`,
    responseShape: "{ name, country: [{ country_id, probability }] }",
  },
  {
    slug: "agify",
    name: "Agify.io",
    category: "Identity",
    tagline: "Estimated age from a first name",
    description: "Statistical age estimate from a given name—demo/statistical use only.",
    auth: "none",
    docsUrl: "https://agify.io/",
    defaultMethod: "GET",
    exampleUrl: "https://api.agify.io?name=michael",
    requestNotes: "GET with name=; optional country_id= for locale.",
    requestExample: "GET ?name=jamie",
    responseExample: `{ "name": "michael", "age": 62, "count": 12345 }`,
    responseShape: "{ name, age, count }",
  },
  {
    slug: "swapi-person",
    name: "SWAPI — Star Wars data",
    category: "Entertainment",
    tagline: "Public Star Wars API",
    description:
      "Classic teaching API: people, films, starships. No authentication; good for pagination examples.",
    auth: "none",
    docsUrl: "https://swapi.dev/documentation",
    defaultMethod: "GET",
    exampleUrl: "https://swapi.dev/api/people/1/",
    requestNotes: "Follow resource URLs or query with ?search=.",
    requestExample: "GET /api/people/1/",
    responseExample: `{
  "name": "Luke Skywalker",
  "height": "172",
  "mass": "77",
  "hair_color": "blond",
  "films": ["https://swapi.dev/api/films/1/"]
}`,
    responseShape: "Film/people/planet objects with URLs to related resources",
  },
];

export const CURATED_APIS: CuratedApiEntry[] = [
  ...CURATED_APIS_CORE,
  ...API_HUB_MORE_ENTRIES,
  ...API_HUB_BULK_ENTRIES,
];

const bySlug = new Map(CURATED_APIS.map((e) => [e.slug, e]));

export function getCuratedApi(slug: string): CuratedApiEntry | undefined {
  return bySlug.get(slug);
}

export function listCategories(): string[] {
  return [...new Set(CURATED_APIS.map((e) => e.category))].sort((a, b) =>
    a.localeCompare(b)
  );
}

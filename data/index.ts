import abdemanaaf from "./abdemanaaf.json";
import dad from "./dad.json";
import type { Person, PersonId } from "@/types/workout";

export const people: Record<PersonId, Person> = {
  abdemanaaf: abdemanaaf as Person,
  dad: dad as Person,
};

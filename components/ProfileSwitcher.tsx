"use client";

import type { PersonId } from "@/types/workout";

interface ProfileSwitcherProps {
  people: { id: PersonId; label: string }[];
  selected: PersonId;
  onSelect: (id: PersonId) => void;
}

export default function ProfileSwitcher({ people, selected, onSelect }: ProfileSwitcherProps) {
  return (
    <div className="inline-flex rounded-full border border-neutral-300 p-1 bg-neutral-100">
      {people.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onSelect(person.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            selected === person.id ? "bg-white shadow text-neutral-900" : "text-neutral-500"
          }`}
        >
          {person.label}
        </button>
      ))}
    </div>
  );
}

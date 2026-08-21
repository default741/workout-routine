"use client";

import type { PersonId } from "@/types/workout";

interface ProfileSwitcherProps {
  people: { id: PersonId; label: string }[];
  selected: PersonId;
  onSelect: (id: PersonId) => void;
}

export default function ProfileSwitcher({ people, selected, onSelect }: ProfileSwitcherProps) {
  return (
    <div className="flex min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-100 p-1">
      {people.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onSelect(person.id)}
          className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors ${
            selected === person.id
              ? "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-900/5"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          {person.label}
        </button>
      ))}
    </div>
  );
}

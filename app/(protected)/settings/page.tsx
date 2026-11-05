import { Badge } from "@/components/ui/badge";
import { cardClass } from "@/components/ui/styles";

const SECTIONS = [
  { title: "Password", text: "Change the password you sign in with." },
  { title: "Notifications", text: "Choose what you are notified about." },
  { title: "Appearance", text: "Language, date format and theme." },
];

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <section
        className={`${cardClass} max-w-2xl divide-y divide-gray-100 p-0`}
      >
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div>
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <p className="text-sm text-gray-500">{section.text}</p>
            </div>
            <Badge>Soon</Badge>
          </div>
        ))}
      </section>
    </main>
  );
}

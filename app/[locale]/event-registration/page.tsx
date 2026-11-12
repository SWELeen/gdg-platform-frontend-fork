import {
  EventInfo,
} from "@/components/event-registration/EventInfo";
import { RegistrationForm } from "@/components/event-registration/RegistrationForm";
import { eventRegistrationMock } from "@/data/event-registration";

export default function EventRegistrationPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <EventInfo event={eventRegistrationMock} />
        <RegistrationForm />
      </div>
    </main>
  );
}

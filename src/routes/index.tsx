import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { store, useStore, useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBar } from "@/components/AdminBar";
import { Plus, Trash2, BarChart3, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Experience Tracker" },
      { name: "description", content: "Track experience and checklists for each person." },
    ],
  }),
  component: Index,
});

function Index() {
  const { people } = useStore();
  const unlocked = useAuth();
  const [showChart, setShowChart] = useState(false);
  const [newName, setNewName] = useState("");

  const addPerson = () => {
    const n = newName.trim();
    if (!n) return;
    store.addPerson(n);
    setNewName("");
  };

  const progress = (p: (typeof people)[number]) => {
    if (!p.items.length) return 0;
    return Math.round(
      (p.items.filter((i) => i.done).length / p.items.length) * 100,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Experience Tracker</h1>
          </div>
          <AdminBar />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {!showChart ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Button size="lg" onClick={() => setShowChart(true)}>
              <BarChart3 className="mr-2 h-5 w-5" />
              Show people
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">People</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowChart(false)}>
                Hide
              </Button>
            </div>

            {unlocked && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a person…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                />
                <Button onClick={addPerson}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {people.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No people yet. {unlocked ? "Add one above." : "Unlock admin to add."}
              </p>
            ) : (
              <ul className="space-y-2">
                {people.map((p) => {
                  const pct = progress(p);
                  return (
                    <li
                      key={p.id}
                      className="group rounded-lg border bg-card transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3 p-4">
                        <Link
                          to="/person/$id"
                          params={{ id: p.id }}
                          className="flex flex-1 items-center gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{p.name}</span>
                              <span className="text-sm tabular-nums text-muted-foreground">
                                {p.items.filter((i) => i.done).length}/
                                {p.items.length} · {pct}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        {unlocked && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Remove ${p.name}?`)) store.removePerson(p.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

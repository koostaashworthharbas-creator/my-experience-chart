import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { store, useStore, useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminBar } from "@/components/AdminBar";
import { ArrowLeft, Plus, Trash2, Pencil, Check, X } from "lucide-react";

export const Route = createFileRoute("/person/$id")({
  component: PersonPage,
});

function PersonPage() {
  const { id } = Route.useParams();
  const { people } = useStore();
  const unlocked = useAuth();
  const navigate = useNavigate();
  const person = people.find((p) => p.id === id);

  const [newItem, setNewItem] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState("");

  if (!person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Person not found.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const addItem = () => {
    const v = newItem.trim();
    if (!v) return;
    store.addItem(person.id, v);
    setNewItem("");
  };

  const saveName = () => {
    const v = nameDraft.trim();
    if (v) store.renamePerson(person.id, v);
    setEditingName(false);
  };

  const saveItem = (itemId: string) => {
    const v = itemDraft.trim();
    if (v) store.renameItem(person.id, itemId, v);
    setEditingItemId(null);
  };

  const done = person.items.filter((i) => i.done).length;
  const pct = person.items.length
    ? Math.round((done / person.items.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <AdminBar />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          {editingName ? (
            <div className="flex gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
              />
              <Button size="icon" onClick={saveName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setEditingName(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">{person.name}</h1>
              {unlocked && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setNameDraft(person.name);
                    setEditingName(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {done} of {person.items.length} complete · {pct}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {unlocked && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Add checklist item…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <Button onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {person.items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No items yet. {unlocked ? "Add one above." : "Unlock admin to add."}
          </p>
        ) : (
          <ul className="space-y-1">
            {person.items.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-md border bg-card p-3"
              >
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => unlocked && store.toggleItem(person.id, item.id)}
                  disabled={!unlocked}
                />
                {editingItemId === item.id ? (
                  <>
                    <Input
                      value={itemDraft}
                      onChange={(e) => setItemDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveItem(item.id)}
                      autoFocus
                    />
                    <Button size="icon" onClick={() => saveItem(item.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingItemId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className={`flex-1 ${item.done ? "text-muted-foreground line-through" : ""}`}
                    >
                      {item.label}
                    </span>
                    {unlocked && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemDraft(item.label);
                            setEditingItemId(item.id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => store.removeItem(person.id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

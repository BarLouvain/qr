"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useListTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuTag } from "@/lib/api/types";

const COLOR_PRESETS = [
  { name: "Oranje", bgColor: "#fff4e0", textColor: "#9a6a00", borderColor: "#ffe0a0" },
  { name: "Rood", bgColor: "#fef0ee", textColor: "#c93a20", borderColor: "#fac8be" },
  { name: "Groen", bgColor: "#eef6ee", textColor: "#2e7a2e", borderColor: "#b8ddb8" },
  { name: "Geel", bgColor: "#fdf6e3", textColor: "#8a6200", borderColor: "#f0d98a" },
  { name: "Blauw", bgColor: "#e8f0fe", textColor: "#1a56a0", borderColor: "#a8c4f0" },
  { name: "Paars", bgColor: "#f3eefe", textColor: "#6b35a8", borderColor: "#c8a8f0" },
  { name: "Grijs", bgColor: "#f0f0f0", textColor: "#555555", borderColor: "#dddddd" },
];

const emptyForm = {
  value: "",
  label: "",
  icon: "",
  bgColor: COLOR_PRESETS[0].bgColor,
  textColor: COLOR_PRESETS[0].textColor,
  borderColor: COLOR_PRESETS[0].borderColor,
  sortOrder: 0,
};

export default function TagsPage() {
  const { data: tags = [], isLoading } = useListTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const { toast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  function selectPreset(preset: typeof COLOR_PRESETS[0]) {
    setForm(f => ({ ...f, bgColor: preset.bgColor, textColor: preset.textColor, borderColor: preset.borderColor }));
  }

  function startEdit(tag: MenuTag) {
    setForm({
      value: tag.value,
      label: tag.label,
      icon: tag.icon,
      bgColor: tag.bgColor,
      textColor: tag.textColor,
      borderColor: tag.borderColor,
      sortOrder: tag.sortOrder,
    });
    setEditingId(tag.id);
    setShowForm(true);
  }

  function cancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId !== null) {
      updateTag.mutate(
        { id: editingId, data: form },
        {
          onSuccess: () => { toast({ title: "Tag bijgewerkt" }); cancel(); },
          onError: () => toast({ title: "Fout bij opslaan", variant: "destructive" }),
        }
      );
    } else {
      createTag.mutate(form, {
        onSuccess: () => { toast({ title: "Tag aangemaakt" }); cancel(); },
        onError: (err) => toast({ title: err.message ?? "Fout bij aanmaken", variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number) {
    deleteTag.mutate({ id }, {
      onSuccess: () => toast({ title: "Tag verwijderd" }),
      onError: () => toast({ title: "Fout bij verwijderen", variant: "destructive" }),
    });
  }

  const isPending = createTag.isPending || updateTag.isPending;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground mt-1">Maak tags aan die je aan menu-items kunt hangen.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nieuwe tag
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-6 bg-card space-y-5">
          <h2 className="font-semibold text-lg">{editingId ? "Tag bewerken" : "Nieuwe tag"}</h2>

          <div className="space-y-2">
            <Label>Weergavenaam</Label>
            <Input
              placeholder="bv. Vegetarisch"
              value={form.label}
              onChange={e => {
                const label = e.target.value;
                const value = label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "");
                setForm(f => ({ ...f, label, ...(editingId === null ? { value } : {}) }));
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icoontje <span className="text-muted-foreground font-normal text-xs">(druk ⊞ + . voor emoji)</span></Label>
            <Input
              placeholder="😊"
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              className="w-24 text-xl text-center"
            />
          </div>

          <div className="space-y-3">
            <Label>Kleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(preset => {
                const active = form.bgColor === preset.bgColor;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    style={{ background: preset.bgColor, color: preset.textColor, borderColor: preset.borderColor }}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Voorbeeld: </span>
              <span
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: form.bgColor, color: form.textColor, border: `1px solid ${form.borderColor}` }}
              >
                {form.icon} {form.label || "Tag naam"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={cancel}>Annuleren</Button>
            <Button type="submit" disabled={isPending}>
              {editingId ? "Opslaan" : "Aanmaken"}
            </Button>
          </div>
        </form>
      )}

      {/* Tag list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Laden...</p>
      ) : tags.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">Nog geen tags. Klik op "Nieuwe tag" om er een aan te maken.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded"
                  style={{ background: tag.bgColor, color: tag.textColor, border: `1px solid ${tag.borderColor}` }}
                >
                  {tag.icon} {tag.label}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{tag.value}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tag)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(tag.id)}
                  disabled={deleteTag.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

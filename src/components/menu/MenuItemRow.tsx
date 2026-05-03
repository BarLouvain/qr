import type { MenuItem, MenuTag } from "@/lib/api/types";

interface MenuItemRowProps {
  item: MenuItem;
  tagDefs: MenuTag[];
}

export function MenuItemRow({ item, tagDefs }: MenuItemRowProps) {
  if (item.featured) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "16px", paddingBottom: "4px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
        <div style={{ background: "var(--featured-bg)", border: "1px solid var(--featured-border)", borderRadius: "6px", padding: "20px" }}>
          {item.featuredBadge && (
            <span style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "6px", display: "block", fontWeight: 600 }}>
              {item.featuredBadge}
            </span>
          )}
          <ItemNameAndDesc item={item} tagDefs={tagDefs} />
        </div>
        <PriceTag price={item.price ?? ""} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "16px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <ItemNameAndDesc item={item} tagDefs={tagDefs} />
      <PriceTag price={item.price ?? ""} />
    </div>
  );
}

function ItemNameAndDesc({ item, tagDefs }: { item: MenuItem; tagDefs: MenuTag[] }) {
  return (
    <div>
      <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text)", letterSpacing: "0.01em", marginBottom: "3px" }}>
        {item.name}
      </div>
      {item.description && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, marginTop: "1px" }}>
          {item.description}
        </div>
      )}
      {item.tags && item.tags.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
          {item.tags.map((tagValue) => (
            <TagBadge key={tagValue} tagValue={tagValue} tagDefs={tagDefs} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagBadge({ tagValue, tagDefs }: { tagValue: string; tagDefs: MenuTag[] }) {
  const def = tagDefs.find(t => t.value === tagValue);

  const style: React.CSSProperties = def
    ? { background: def.bgColor, color: def.textColor, border: `1px solid ${def.borderColor}` }
    : { background: "#f0f0f0", color: "#555", border: "1px solid #ddd" };

  const label = def ? `${def.icon} ${def.label}`.trim() : tagValue;

  return (
    <span style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "3px", fontWeight: 600, ...style }}>
      {label}
    </span>
  );
}

function formatPrice(price: string): string {
  return price
    .split(/(\s*[|\/]\s*)/)
    .map((part) => (/[|\/]/.test(part) ? part : /\S/.test(part) ? `€${part.trim()}` : part))
    .join("");
}

function PriceTag({ price }: { price: string }) {
  return (
    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "var(--gold)", letterSpacing: "0.05em", whiteSpace: "nowrap", paddingTop: "2px" }}>
      {formatPrice(price)}
    </div>
  );
}

import type { MenuItem } from "@/lib/api/types";

interface MenuItemRowProps {
  item: MenuItem;
}

export function MenuItemRow({ item }: MenuItemRowProps) {
  if (item.featured) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "start",
          gap: "16px",
          paddingBottom: "4px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            background: "var(--featured-bg)",
            border: "1px solid var(--featured-border)",
            borderRadius: "6px",
            padding: "20px",
          }}
        >
          {item.featuredBadge && (
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: "6px",
                display: "block",
                fontWeight: 600,
              }}
            >
              {item.featuredBadge}
            </span>
          )}
          <ItemNameAndDesc item={item} />
        </div>
        <PriceTag price={item.price ?? ""} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "start",
        gap: "16px",
        padding: "14px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <ItemNameAndDesc item={item} />
      <PriceTag price={item.price ?? ""} />
    </div>
  );
}

function ItemNameAndDesc({ item }: { item: MenuItem }) {
  return (
    <div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--text)",
          letterSpacing: "0.01em",
          marginBottom: "3px",
        }}
      >
        {item.name}
      </div>
      {item.description && (
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontStyle: "italic",
            lineHeight: 1.5,
            marginTop: "1px",
          }}
        >
          {item.description}
        </div>
      )}
      {item.tags && item.tags.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
          {item.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const styles: Record<string, React.CSSProperties> = {
    bestseller: { background: "#fff4e0", color: "#9a6a00", border: "1px solid #ffe0a0" },
    popular: { background: "#fef0ee", color: "#c93a20", border: "1px solid #fac8be" },
    alcoholvrij: { background: "#eef6ee", color: "#2e7a2e", border: "1px solid #b8ddb8" },
  };

  const labels: Record<string, string> = {
    bestseller: "Bestseller",
    popular: "Berucht",
    alcoholvrij: "Alcoholvrij",
  };

  return (
    <span
      style={{
        fontSize: "9px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: "3px",
        fontWeight: 600,
        ...(styles[tag] ?? { background: "#f0f0f0", color: "#555", border: "1px solid #ddd" }),
      }}
    >
      {labels[tag] ?? tag}
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
    <div
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "20px",
        color: "var(--gold)",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
        paddingTop: "2px",
      }}
    >
      {formatPrice(price)}
    </div>
  );
}

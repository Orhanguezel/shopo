"use client";

import styled from "styled-components";

type Props = {
  ariaLabel: string;
  page: number;
  totalPages: number;
  hasPrev?: boolean; // geriye uyumluluk (opsiyonel)
  hasNext?: boolean; // geriye uyumluluk (opsiyonel)
  prevLabel: string;
  nextLabel: string;
  onChange: (p: number) => void;
};

// 1 … (p-1) p (p+1) … N (penceresi=1)
function getWindowedPages(current: number, total: number, windowSize = 1) {
  const items: (number | "...")[] = [];
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }

  items.push(1);
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("...");
  items.push(total);

  return items;
}

export default function Pagination({
  ariaLabel, page, totalPages, hasPrev, hasNext, prevLabel, nextLabel, onChange,
}: Props) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const prevDisabled = hasPrev !== undefined ? !hasPrev : safePage <= 1;
  const nextDisabled = hasNext !== undefined ? !hasNext : safePage >= totalPages;

  const items = getWindowedPages(safePage, totalPages, 1);

  return (
    <Nav aria-label={ariaLabel}>
      <Btn
        type="button"
        onClick={() => onChange(Math.max(1, safePage - 1))}
        disabled={prevDisabled}
        aria-label={`${prevLabel}, ${Math.max(1, safePage - 1)}`}
      >
        ← {prevLabel}
      </Btn>

      <Pages>
        {items.map((it, idx) =>
          it === "..." ? (
            <Ellipsis key={`e-${idx}`}>…</Ellipsis>
          ) : (
            <Page
              key={it}
              type="button"
              $active={it === safePage}
              onClick={it === safePage ? undefined : () => onChange(it as number)}
              aria-current={it === safePage ? "page" : undefined}
              title={String(it)}
            >
              {it}
            </Page>
          )
        )}
      </Pages>

      <Btn
        type="button"
        onClick={() => onChange(Math.min(totalPages, safePage + 1))}
        disabled={nextDisabled}
        aria-label={`${nextLabel}, ${Math.min(totalPages, safePage + 1)}`}
      >
        {nextLabel} →
      </Btn>
    </Nav>
  );
}

const Nav = styled.nav`
  display:flex; align-items:center; justify-content:center; gap:10px; margin-top:18px;
`;

const Btn = styled.button`
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md};
  border:1px solid ${({ theme }) => theme.colors.borderBright};
  background:${({ theme }) => theme.colors.inputBackgroundLight};
  color:${({ theme }) => theme.colors.textSecondary};
  cursor:pointer;
  &:disabled { opacity:.6; cursor:not-allowed; }
`;

const Pages = styled.div`
  display:flex; align-items:center; gap:6px;
`;

const Ellipsis = styled.span`
  padding:8px 10px;
  color:${({ theme }) => theme.colors.textSecondary};
  user-select:none;
`;

const Page = styled.button<{ $active?: boolean }>`
  padding:8px 12px; border-radius:${({ theme }) => theme.radii.md};
  border:1px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderBright)};
  background:
    ${({ $active, theme }) => ($active ? theme.colors.primaryTransparent : theme.colors.inputBackgroundLight)};
  color:${({ theme }) => theme.colors.text};
  font-weight:${({ $active, theme }) => ($active ? theme.fontWeights.bold : theme.fontWeights.medium)};
  cursor:pointer;
  &:disabled { cursor:default; }
`;

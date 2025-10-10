import styled from "styled-components";
import { Card as BaseCard } from "./uiCommon";

export const HeaderRow = styled.div` display:flex; justify-content:space-between; align-items:flex-end; margin: 8px 0 16px; `;
export const HeaderRight = styled.div`display:flex; align-items:center; gap:12px;`;
export const Small = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $muted }) => $muted ? theme.colors.textSecondary : theme.colors.text};
`;
export const DangerBtn = styled.button`
  border: none; border-radius: ${({ theme }) => theme.radii.lg}; padding: 10px 14px;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold}; color: #fff;
  background: ${({ theme }) => theme.colors.danger};
  transition: background ${({ theme }) => theme.durations.fast} ease;
  &:hover { background: ${({ theme }) => theme.colors.dangerHover}; }
`;

export const KpiGrid = styled.section`
  display:grid; gap: 16px;
  grid-template-columns: repeat(4, minmax(0,1fr));
  ${({ theme }) => theme.media.medium} { grid-template-columns: repeat(2, minmax(0,1fr)); }
  ${({ theme }) => theme.media.xsmall} { grid-template-columns: 1fr; }
`;
export const KpiCard = styled.div`
  background: linear-gradient(135deg, ${({ $from }) => $from}, ${({ $to }) => $to});
  color:#fff; border-radius:${({ theme }) => theme.radii.xl}; padding:18px;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;
export const KpiTitle = styled.div` font-size: ${({ theme }) => theme.fontSizes.sm}; opacity: .9; `;
export const KpiValue = styled.div` font-size: 36px; font-weight: ${({ theme }) => theme.fontWeights.bold}; margin: 6px 0 8px; `;
export const KpiBars = styled.div`
  display:grid; gap: 6px;
  & > div { display:grid; grid-template-columns: 72px 1fr; align-items:center; gap: 8px; }
  span { font-size: ${({ theme }) => theme.fontSizes.xs}; opacity:.95; }
`;
export const BarBase = styled.div` height: 6px; border-radius: 9999px; background: rgba(255,255,255,.35); overflow:hidden; `;
export const BarFill = styled.div`height:100%; background:#fff; opacity:.95;`;
export const BarFillAlt = styled(BarFill)`opacity:.7;`;

export const ChartsGrid = styled.section`
  display:grid; gap: 16px; margin: 18px 0;
  grid-template-columns: 2fr 1.5fr;
  ${({ theme }) => theme.media.medium} { grid-template-columns: 1fr; }
`;
export const ChartCard = styled(BaseCard)` overflow:hidden; display:flex; flex-direction:column; min-height: 320px; `;
export const CardHead = styled.div` display:flex; align-items:baseline; justify-content:space-between; padding: 14px 14px 6px; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight}; `;
export const CardTitle = styled.h3` margin:0; font-size:${({ theme }) => theme.fontSizes.md}; color:${({ theme }) => theme.colors.text}; font-weight:${({ theme }) => theme.fontWeights.semiBold}; `;
export const ChartBody = styled.div`flex:1; min-height:260px; padding: 6px 4px;`;

export const BottomGrid = styled.section` display:grid; gap:16px; grid-template-columns: 1.2fr 1fr; ${({ theme }) => theme.media.medium} { grid-template-columns: 1fr; } `;
export const Card = styled(BaseCard)` overflow:hidden; `;
export const List = styled.ul`
  list-style:none; margin:0; padding: 6px 10px 10px;
  & > li { display:flex; align-items:center; justify-content:space-between; padding: 10px 8px; border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight}; }
  & > li:last-child { border-bottom: 0; }
`;
export const Tag = styled.span`
  font-size:${({ theme }) => theme.fontSizes.xs}; color:${({ theme }) => theme.colors.text};
  background:${({ theme }) => theme.colors.inputBackgroundFocus};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.pill}; padding: 4px 8px;
`;
export const QuickLinks = styled.div` display:grid; gap:10px; padding: 12px; grid-template-columns: repeat(2, minmax(0,1fr)); ${({ theme }) => theme.media.xsmall} { grid-template-columns: 1fr; } `;
export const QuickLink = styled.a`
  text-decoration:none; display:inline-flex; align-items:center; justify-content:center;
  height:44px; border-radius:${({ theme }) => theme.radii.lg};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackground};
  color:${({ theme }) => theme.colors.text};
  font-weight:${({ theme }) => theme.fontWeights.medium};
  transition: transform ${({ theme }) => theme.durations.fast}, background ${({ theme }) => theme.durations.fast};
  &:hover { transform: translateY(-1px); background:${({ theme }) => theme.colors.hoverBackground}; }
`;
export const Note = styled.p` color: ${({ theme }) => theme.colors.textSecondary}; font-size: ${({ theme }) => theme.fontSizes.md}; `;

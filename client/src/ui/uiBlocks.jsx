import styled from "styled-components";

export const Toolbar = styled.div`
  display:flex; flex-direction:column; gap:10px; margin-bottom:10px;
  @media (min-width: 720px){ flex-direction:row; align-items:center; justify-content:space-between; }
`;
export const ViewTabs = styled.div` display:flex; gap:8px; `;
export const ViewTab = styled.button`
  height:32px; padding:0 12px; border-radius:9999px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackground};
  &[data-active="true"]{ background:${({ theme }) => theme.colors.primary}; color:#fff; border-color:transparent; }
`;
export const LangTabs = styled.div` display:flex; gap:8px; align-items:center; flex-wrap:wrap; `;
export const Tab = styled.button`
  height:32px; padding:0 10px; border-radius:9999px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackground};
  &[data-active="true"]{ background:${({ theme }) => theme.colors.primary}; color:#fff; border-color:transparent; }
`;
export const LangRight = styled.div` margin-left:auto; display:flex; align-items:center; gap:8px; `;
export const SelectInline = styled.select`
  height:32px; min-width:110px; padding:0 10px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg}; background:${({ theme }) => theme.inputs.background};
`;
export const Grid = styled.div`
  display:grid; gap:16px; grid-template-columns: repeat(12, 1fr);
  & > section { grid-column: span 12; }
  @media (min-width: 900px) { & > section { grid-column: span 6; } }
`;
export const Block = styled.section`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius:${({ theme }) => theme.radii.lg};
  padding:14px; h3{ margin:0 0 8px; }
`;
export const Fields = styled.div` display:grid; gap:12px; `;
export const TextArea = styled.textarea`
  min-height:120px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg};
  background:${({ theme }) => theme.inputs.background};
  padding:10px 12px; resize:vertical;
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; background:${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;
export const ActionsRow = styled.div` display:flex; justify-content:flex-end; gap:8px; margin-top:12px; `;
export const InlineRow = styled.div` display:flex; gap:8px; flex-wrap:wrap; `;
export const Thumbs = styled.div`
  display:flex; gap:8px; flex-wrap:wrap;
  img{ width:84px; height:84px; object-fit:cover; border-radius:10px; border:1px solid ${({ theme }) => theme.colors.border}; }
`;
export const Hint = styled.span`
  display:inline-flex; align-items:center; gap:6px; font-size:${({ theme }) => theme.fontSizes.xs};
  color:${({ theme }) => theme.colors.textSecondary}; background:${({ theme }) => theme.colors.inputBackgroundLight};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius:${({ theme }) => theme.radii.pill}; padding:2px 8px;
`;
export const IconButton = styled.button`
  width:32px; height:32px; border-radius:9999px; display:inline-grid; place-items:center;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackground};
  &:hover{ background:${({ theme }) => theme.colors.hoverBackground}; }
`;
export const Select = styled.select`
  height:40px; min-width:120px; padding:0 10px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg}; background:${({ theme }) => theme.inputs.background};
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; background:${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;

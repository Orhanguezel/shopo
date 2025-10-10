import styled from "styled-components";

/* ============ layout ============ */
export const Wrap = styled.main`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 16px auto 32px;
  padding: 0 16px 32px;
`;
export const Head = styled.div`
  display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin:6px 0 12px;
`;
export const H1 = styled.h1`
  margin:0; font-size:${({ theme }) => theme.fontSizes.h3}; color:${({ theme }) => theme.colors.title};
  font-weight:${({ theme }) => theme.fontWeights.semiBold};
`;
export const Muted = styled.p` color:${({ theme }) => theme.colors.textSecondary}; margin:0; `;
export const Card = styled.section`
  background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
  border-radius:${({ theme }) => theme.radii.xl};
  box-shadow:${({ theme }) => theme.cards.shadow};
`;

/* ============ filters ============ */
export const Actions = styled.div` display:flex; gap:10px; align-items:center; flex-wrap:wrap; `;
export const Search = styled.input.attrs({ type:"search" })`
  height:38px; min-width:220px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg};
  background:${({ theme }) => theme.inputs.background};
  padding:0 12px;
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; background:${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;
export const Select = styled.select`
  height:38px; min-width:120px; padding:0 10px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg}; background:${({ theme }) => theme.inputs.background};
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; }
`;

/* ============ table ============ */
export const TableWrap = styled.div` width:100%; overflow:auto; `;

export const Table = styled.table`
  width:100%;
  border-collapse:separate;
  border-spacing:0;
  font-size:${({ theme }) => theme.fontSizes.sm};

  th, td {
    padding:12px 12px;
    text-align:left;
    border-bottom:1px solid ${({ theme }) => theme.colors.borderLight};
    vertical-align: middle;
  }

  thead th {
    background:${({ theme }) => theme.colors.tableHeader};
    color:${({ theme }) => theme.colors.text};
    position:sticky; top:0; z-index:1;
  }

  ${({ theme }) => theme.media.mobile} {
    display:block;
    thead { display:none; }
    tbody { display:block; }

    tr {
      display:block;
      margin:12px 12px;
      background:${({ theme }) => theme.colors.cardBackground};
      border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
      border-radius:${({ theme }) => theme.radii.xl};
      box-shadow:${({ theme }) => theme.shadows.sm};
      overflow:hidden;
    }

    td {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      border-bottom:1px solid ${({ theme }) => theme.colors.borderLight};
      padding:10px 12px;
    }
    td:last-child { border-bottom:0; }

    td::before {
      content: attr(data-label);
      flex:0 0 44%;
      max-width:50%;
      color:${({ theme }) => theme.colors.textSecondary};
      font-weight:${({ theme }) => theme.fontWeights.medium};
      padding-right:10px;
    }

    td[data-label="Kullanıcı"] { display:block; padding:12px 12px 6px; }
    td[data-label="Kullanıcı"]::before { display:none; }
    td[data-label="İşlemler"] { display:block; padding:12px; }
  }
`;

export const Pager = styled.div` display:flex; align-items:center; justify-content:space-between; padding:10px 12px; `;

export const UserCell = styled.div`
  display:flex; align-items:center; gap:10px;
  ${({ theme }) => theme.media.mobile} { align-items:flex-start; }
`;
export const Avatar = styled.div`
  width:28px;height:28px;border-radius:9999px; background:${({ theme }) => theme.colors.primary};
  color:#fff; display:grid; place-items:center; font-weight:${({ theme }) => theme.fontWeights.semiBold};
`;
export const Badge = styled.span`
  display:inline-flex; padding:4px 8px; border-radius:${({ theme }) => theme.radii.pill};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackgroundFocus};
`;
export const Status = styled.span`
  color: ${({ theme, $ok }) => ($ok ? theme.colors.textOnSuccess : theme.colors.textOnDanger)};
  background: ${({ theme, $ok }) => ($ok ? theme.colors.successBg : theme.colors.dangerBg)};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;
export const RowActions = styled.div` display:flex; gap:6px; align-items:center; flex-wrap:wrap; `;
export const Empty = styled.div` padding:24px; color:${({ theme }) => theme.colors.textSecondary}; text-align:center; `;
export const Skeleton = styled.div` height:16px; background:${({ theme }) => theme.colors.skeleton}; border-radius:8px; `;

/* ============ buttons ============ */
export const Button = styled.button`
  height:36px; padding:0 10px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.lg}; background:${({ theme }) => theme.colors.inputBackground};
  &:hover{ background:${({ theme }) => theme.colors.hoverBackground}; }
`;
export const Primary = styled(Button)`
  background:${({ theme }) => theme.buttons.primary.background}; border:0; color:#fff; font-weight:${({ theme }) => theme.fontWeights.semiBold};
  &:hover{ background:${({ theme }) => theme.buttons.primary.backgroundHover}; }
`;
export const ButtonOutline = styled(Button)``;
export const ButtonDanger = styled(Button)`
  border:0; background:${({ theme }) => theme.colors.danger}; color:#fff; &:hover{ background:${({ theme }) => theme.colors.dangerHover}; }
`;

/* ============ modals/drawers ============ */
export const ModalBackdrop = styled.div`
  position:fixed; inset:0; background:rgba(0,0,0,.28); display:grid; place-items:center; z-index:1200;
`;
export const ModalCard = styled.div`
  width:520px; max-width:92%; background:${({ theme }) => theme.colors.cardBackground};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  border-radius:${({ theme }) => theme.radii.xl}; box-shadow:${({ theme }) => theme.shadows.lg};
  padding:16px; & > h3 { margin:0 0 8px; }
`;
export const ModalActions = styled.div` display:flex; justify-content:flex-end; gap:8px; margin-top:8px; `;

export const Drawer = styled.div` position:fixed; inset:0; background:rgba(0,0,0,.28); z-index:1200; `;
export const DrawerPanel = styled.div`
  position:fixed; top:0; right:0; height:100%; width:420px; max-width:95%;
  background:${({ theme }) => theme.colors.cardBackground};
  border-left:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow:${({ theme }) => theme.shadows.lg};
  z-index:1300; padding:16px;
`;
export const DrawerHead = styled.div` margin-bottom:10px; & > h3 { margin:0 0 4px; } `;
export const DrawerActions = styled.div` display:flex; justify-content:flex-end; gap:8px; margin-top:8px; `;

/* ============ form bits ============ */
export const Form = styled.form` display:grid; gap:12px; `;
export const Field = styled.div` display:grid; gap:6px; `;
export const FieldRow = styled.div` display:flex; align-items:center; gap:10px; `;
export const Label = styled.label` font-size:${({ theme }) => theme.fontSizes.sm}; color:${({ theme }) => theme.colors.textSecondary}; `;
export const Input = styled.input`
  height:40px; border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg}; background:${({ theme }) => theme.inputs.background};
  padding:0 12px;
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; background:${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;
export const TextArea = styled.textarea`
  min-height:120px;
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.inputBorder};
  border-radius:${({ theme }) => theme.radii.lg};
  background:${({ theme }) => theme.inputs.background};
  padding:10px 12px; resize:vertical;
  &:focus{ outline:none; border-color:${({ theme }) => theme.inputs.borderFocus}; box-shadow:${({ theme }) => theme.colors.shadowHighlight}; background:${({ theme }) => theme.colors.inputBackgroundFocus}; }
`;
export const Switch = styled.button`
  width:44px; height:26px; border-radius:9999px; border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  background:${({ theme }) => theme.colors.inputBackground}; position:relative;
  &[data-on="true"] { background:${({ theme }) => theme.colors.primaryTransparent}; border-color:${({ theme }) => theme.colors.inputBorderFocus}; }
  i{ position:absolute; top:2px; left:2px; width:22px; height:22px; background:#fff; border-radius:9999px; transition:transform .2s ease; box-shadow:${({ theme }) => theme.shadows.sm}; }
  &[data-on="true"] i{ transform:translateX(18px); }
`;

/* ============ extras ============ */
export const SectionTitle = styled.h3`
  margin: 10px 0 6px;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
`;
export const Divider = styled.hr`
  border:0; border-top:1px solid ${({ theme }) => theme.colors.borderLight};
  margin:12px 0;
`;
export const Grid12 = styled.div`
  display:grid; gap:16px; grid-template-columns:repeat(12,1fr);
  & > section { grid-column: span 12; }
  @media (min-width: 900px) { & > section { grid-column: span 6; } }
`;
export const Block = styled.section`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderLight};
  border-radius:${({ theme }) => theme.radii.lg};
  padding:14px; h3{ margin:0 0 8px; }
`;
export const Note = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin: 8px 0;
`;

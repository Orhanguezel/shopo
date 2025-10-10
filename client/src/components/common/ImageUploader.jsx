// src/components/common/ImageUploader.jsx
import styled from "styled-components";
import PropTypes from "prop-types";
import { useMemo, useRef, useEffect, useState, useCallback } from "react";

/** Basit yerel çeviri sözlüğü */
const DICT = {
  tr: {
    add: "+ Görsel ekle ({left} kaldı)",
    hint: "Sürükle-bırak veya tıkla",
    paste: "veya yapıştır",
    removeExisting: "Mevcut görseli kaldır",
    removeNew: "Yeni dosyayı kaldır",
    remove: "Kaldır",
    typeMismatch: "Bazı dosyalar kabul edilen türlerle uyuşmuyor",
    tooLarge: "Bazı dosyalar boyut limitini aşıyor",
    count: "{used}/{max} kullanıldı",
    sizeLimit: "Maks {n}MB/dosya",
  },
  en: {
    add: "+ Add Images ({left} left)",
    hint: "Drag & drop, click to browse",
    paste: "or paste",
    removeExisting: "Remove image",
    removeNew: "Remove new file",
    remove: "Remove",
    typeMismatch: "Some files are not allowed by the accept filter",
    tooLarge: "Some files exceed size limit",
    count: "{used}/{max} used",
    sizeLimit: "Max {n}MB/file",
  },
};

function tKey(key, locale, overrides) {
  const dict = (locale && DICT[locale]) || DICT.en;
  return (overrides && overrides[key]) || dict[key] || DICT.en[key];
}

function short(s) {
  return (s || "").split("/").pop() || s || "";
}

export default function ImageUploader({
  existing,
  onExistingChange,
  removedExisting,
  onRemovedExistingChange,
  files,
  onFilesChange,
  maxFiles = 5,
  accept = "image/*",
  sizeLimitMB = 15,
  disabled,
  allowPaste = true,
  helpText,
  locale = "en",
  messages,
}) {
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const previews = useMemo(
    () =>
      (files || []).map((f) => ({
        key: `${f.name}-${f.size}-${f.lastModified}`,
        name: f.name,
        url: URL.createObjectURL(f),
      })),
    [files]
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const totalCount = (existing?.length || 0) + (files?.length || 0);
  const left = Math.max(0, (maxFiles || 0) - totalCount);
  const pickLabel = tKey("add", locale, messages).replace("{left}", String(left));

  const resetErrorSoon = () => {
    window.setTimeout(() => setError(null), 2500);
  };

  const matchesAccept = useCallback(
    (file) => {
      if (!accept) return true;
      const tokens = accept
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (!tokens.length) return true;

      const mime = (file.type || "").toLowerCase();
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();

      for (const tok of tokens) {
        if (tok === "*/*") return true;
        if (tok.endsWith("/*")) {
          const prefix = tok.slice(0, tok.length - 1); // "image/"
          if (mime.startsWith(prefix)) return true;
        } else if (tok.startsWith(".")) {
          if (ext === tok) return true;
        } else {
          if (mime === tok) return true;
        }
      }
      return false;
    },
    [accept]
  );

  const filterIncoming = useCallback(
    (incoming) => {
      const next = [];
      const nameset = new Set((files || []).map((f) => `${f.name}-${f.size}`));
      const maxBytes = sizeLimitMB * 1024 * 1024;

      for (const f of incoming) {
        if (left <= next.length) break;

        const sig = `${f.name}-${f.size}`;
        if (nameset.has(sig)) continue;

        if (!matchesAccept(f)) {
          setError(tKey("typeMismatch", locale, messages));
          continue;
        }
        if (maxBytes > 0 && f.size > maxBytes) {
          setError(tKey("tooLarge", locale, messages));
          continue;
        }

        next.push(f);
        nameset.add(sig);
      }
      if (!next.length && incoming.length) resetErrorSoon();
      return next;
    },
    [files, left, sizeLimitMB, matchesAccept, locale, messages]
  );

  const handlePick = (picked) => {
    if (!picked.length) return;
    const filtered = filterIncoming(picked).slice(0, left);
    if (!filtered.length) return;
    onFilesChange([...(files || []), ...filtered]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    setDragOver(false);
    const picked = Array.from(e.dataTransfer.files || []);
    handlePick(picked);
  };

  const onPaste = (e) => {
    if (disabled || !allowPaste) return;
    const items = Array.from(e.clipboardData.items || []);
    const imgs = [];
    items.forEach((it) => {
      const f = it.getAsFile?.();
      if (f && f.type?.startsWith("image/")) imgs.push(f);
    });
    if (imgs.length) handlePick(imgs);
  };

  const removeExisting = (img) => {
    const next = (existing || []).filter((x) =>
      img._id ? x._id !== img._id : x.url !== img.url
    );
    onExistingChange(next);
    if (onRemovedExistingChange) {
      onRemovedExistingChange([...(removedExisting || []), img]);
    }
  };

  const removeFile = (idx) => {
    onFilesChange((files || []).filter((_, i) => i !== idx));
  };

  const canAdd = left > 0 && !disabled;

  return (
    <Wrap onPaste={onPaste}>
      <Drop
        ref={dropRef}
        $dragOver={dragOver}
        role="button"
        tabIndex={0}
        aria-disabled={!canAdd}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (canAdd) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => canAdd && inputRef.current?.click()}
      >
        <DropTitle>{pickLabel}</DropTitle>
        <DropSub>
          {tKey("hint", locale, messages)}
          {allowPaste ? ` • ${tKey("paste", locale, messages)}` : ""}
          {helpText ? ` • ${helpText}` : ""}
        </DropSub>
      </Drop>

      {error && <ErrorText role="alert">{error}</ErrorText>}

      <Grid>
        {(existing || []).map((img) => (
          <Item key={img._id || img.url}>
            <Thumb $bg={img.thumbnail || img.webp || img.url} role="img" aria-label={short(img.url)} />
            <Row>
              <span className="mono small" title={img.url}>
                {short(img.url)}
              </span>
              <Danger
                type="button"
                onClick={() => removeExisting(img)}
                aria-label={tKey("removeExisting", locale, messages)}
              >
                {tKey("remove", locale, messages)}
              </Danger>
            </Row>
          </Item>
        ))}

        {previews.map((p, i) => (
          <Item key={p.key}>
            <Thumb $bg={p.url} role="img" aria-label={p.name} />
            <Row>
              <span className="mono small" title={p.name}>
                {p.name}
              </span>
              <Danger
                type="button"
                onClick={() => removeFile(i)}
                aria-label={tKey("removeNew", locale, messages)}
              >
                {tKey("remove", locale, messages)}
              </Danger>
            </Row>
          </Item>
        ))}
      </Grid>

      <Actions>
        <Btn
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canAdd}
          aria-disabled={!canAdd}
        >
          {pickLabel}
        </Btn>

        <HiddenInput
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          disabled={!canAdd}
          onChange={(e) => {
            const picked = Array.from(e.target.files || []);
            handlePick(picked);
            e.currentTarget.value = "";
          }}
        />
      </Actions>

      <SmallInfo>
        {tKey("count", locale, messages)
          .replace("{used}", String(totalCount))
          .replace("{max}", String(maxFiles))}
        {sizeLimitMB
          ? ` • ${tKey("sizeLimit", locale, messages).replace("{n}", String(sizeLimitMB))}`
          : ""}
      </SmallInfo>
    </Wrap>
  );
}

ImageUploader.propTypes = {
  existing: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      url: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      webp: PropTypes.string,
      publicId: PropTypes.string,
      type: PropTypes.string,
    })
  ).isRequired,
  onExistingChange: PropTypes.func.isRequired,

  removedExisting: PropTypes.array,
  onRemovedExistingChange: PropTypes.func,

  files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  onFilesChange: PropTypes.func.isRequired,

  maxFiles: PropTypes.number,
  accept: PropTypes.string,
  sizeLimitMB: PropTypes.number,
  disabled: PropTypes.bool,
  allowPaste: PropTypes.bool,
  helpText: PropTypes.string,
  locale: PropTypes.string,
  messages: PropTypes.object,
};

ImageUploader.defaultProps = {
  removedExisting: undefined,
  onRemovedExistingChange: undefined,
  maxFiles: 5,
  accept: "image/*",
  sizeLimitMB: 15,
  disabled: false,
  allowPaste: true,
  helpText: "",
  locale: "en",
  messages: undefined,
};

/* ---- styled (adminTheme ile uyumlu) ---- */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacings.sm};
`;

const Drop = styled.div`
  border: ${({ theme }) => theme.borders.thin}
    ${({ theme, $dragOver }) => ($dragOver ? theme.colors.borderHighlight : theme.colors.border)};
  background: ${({ theme }) => theme.colors.inputBackgroundSofter};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.lg};
  text-align: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
  opacity: ${({ $dragOver }) => ($dragOver ? 0.95 : 1)};
`;

const DropTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: ${({ theme }) => theme.spacings.xs};
`;

const DropSub = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacings.xs};
`;

const BaseButton = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  box-shadow: ${({ theme }) => theme.shadows.button};

  &:disabled,
  &[aria-disabled="true"] {
    opacity: ${({ theme }) => theme.opacity.disabled};
    cursor: not-allowed;
  }
  &:hover {
    background: ${({ theme }) => theme.buttons.secondary.backgroundHover};
    color: ${({ theme }) => theme.buttons.secondary.textHover};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.colors.shadowHighlight};
  }
`;

const Btn = styled(BaseButton)``;

const HiddenInput = styled.input`
  display: none;
`;

const SmallInfo = styled.div`
  text-align: right;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacings.sm};
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
`;

const Item = styled.div`
  position: relative;
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.cards.border};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.cards.background};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  transition: transform .06s ease, box-shadow .12s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.cards.hoverBackground};
  }
`;

const Thumb = styled.div`
  width: 100%;
  padding-top: 66%;
  background-image: ${({ $bg }) => `url(${$bg})`};
  background-size: cover;
  background-position: center;
  border-bottom: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.borderBright};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ theme }) => theme.spacings.sm};

  .mono.small {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Danger = styled(BaseButton)`
  background: ${({ theme }) => theme.buttons.danger.background};
  color: ${({ theme }) => theme.buttons.danger.text};
  border-color: ${({ theme }) => theme.colors.danger};

  &:hover {
    background: ${({ theme }) => theme.buttons.danger.backgroundHover};
    color: ${({ theme }) => theme.buttons.danger.textHover};
  }
`;

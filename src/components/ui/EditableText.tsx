import { detectLinks } from "@/lib/utils/link-detection";
import { memo, useCallback, useMemo, useState } from "react";

interface EditableTextProps {
  text: string;
  onEdit: (newText: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EditableText = memo<EditableTextProps>(
  ({ text, onEdit, className = "", style = {} }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);

    const handleSave = useCallback(() => {
      onEdit(editText);
      setIsEditing(false);
    }, [editText, onEdit]);

    const handleCancel = useCallback(() => {
      setEditText(text);
      setIsEditing(false);
    }, [text]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          handleSave();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          handleCancel();
        }
      },
      [handleSave, handleCancel]
    );

    const handleClick = useCallback((e: React.MouseEvent) => {
      // 링크 클릭이 아닌 경우에만 편집 모드 진입
      if (!(e.target as Element).closest(".postit-link")) {
        setIsEditing(true);
      }
    }, []);

    const stopPropagation = useCallback((e: React.PointerEvent) => {
      e.stopPropagation();
    }, []);

    // 링크 클릭 핸들러
    const handleLinkClick = useCallback((url: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(url, "_blank", "noopener,noreferrer");
    }, []);

    // 텍스트에서 링크를 감지하고 렌더링할 내용 준비
    const renderContent = useMemo(() => {
      const links = detectLinks(text);

      if (links.length === 0) {
        return text;
      }

      const parts = [];
      let currentIndex = 0;

      // 정렬된 링크 순서대로 처리
      const sortedLinks = [...links].sort(
        (a, b) => a.startIndex - b.startIndex
      );

      for (const link of sortedLinks) {
        // 링크 이전 텍스트 추가
        if (currentIndex < link.startIndex) {
          parts.push(text.slice(currentIndex, link.startIndex));
        }

        // 링크 추가
        parts.push(
          <span
            key={`link-${link.startIndex}`}
            className="postit-link"
            onClick={(e) => handleLinkClick(link.url, e)}
            onPointerDown={stopPropagation}
          >
            {link.domain}
            <span className="postit-link-icon">🔗</span>
          </span>
        );

        currentIndex = link.endIndex;
      }

      // 마지막 링크 이후 텍스트 추가
      if (currentIndex < text.length) {
        parts.push(text.slice(currentIndex));
      }

      return parts;
    }, [text, handleLinkClick, stopPropagation]);

    if (isEditing) {
      return (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onPointerDown={stopPropagation}
          className={`${className} bg-transparent border-none outline-none w-full text-postit`}
          style={style}
          autoFocus
        />
      );
    }

    return (
      <div
        className={`${className} cursor-text text-postit`}
        style={style}
        onClick={handleClick}
        onPointerDown={stopPropagation}
      >
        {renderContent}
      </div>
    );
  }
);

EditableText.displayName = "EditableText";

import { memo, useState, useCallback } from "react";

interface EditableTextProps {
  text: string;
  onEdit: (newText: string) => void;
  className?: string;
}

export const EditableText = memo<EditableTextProps>(({ 
  text, 
  onEdit, 
  className = "" 
}) => {
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
  }, [handleSave, handleCancel]);

  const handleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopPropagation = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  if (isEditing) {
    return (
      <input
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onPointerDown={stopPropagation}
        className={`${className} bg-transparent border-none outline-none w-full`}
        autoFocus
      />
    );
  }

  return (
    <div
      className={`${className} cursor-text`}
      onClick={handleClick}
      onPointerDown={stopPropagation}
    >
      {text}
    </div>
  );
});

EditableText.displayName = "EditableText";
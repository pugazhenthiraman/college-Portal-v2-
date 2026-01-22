import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

type ValidationResult = true | string;

export interface FormActionsConfig<T> {
  // Core callbacks
  onSave: (data: T[]) => void;
  getMissingFields?: (data: T) => string[];
  diffFields?: (orig: T, updated: T) => string[];
  
  // Optional configurations
  validateBeforeSave?: (draft: T) => ValidationResult;
  toastDuration?: number;
  confirmSave?: boolean;
  allowPartialSave?: boolean;
}

export function useFormActions<T extends Record<string, any>>({
  onSave,
  getMissingFields,
  diffFields,
  validateBeforeSave,
  toastDuration = 4000,
  confirmSave = false,
  allowPartialSave = true,
}: FormActionsConfig<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<T | null>(null);

  // Format field names for display
  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Format missing fields message
  const formatMissingFields = (fields: string[]): string => {
    if (fields.length === 0) return "";
    
    const formatted = fields.map(formatFieldName);
    if (fields.length === 1) return formatted[0];
    if (fields.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    
    return `${formatted[0]}, ${formatted[1]}, and ${fields.length - 2} more`;
  };

  // Start editing an existing item
  const startEdit = useCallback((index: number, item: T) => {
    setEditingIndex(index);
    setDraft(item);
  }, []);

  // Start adding a new item
  const startAdd = useCallback((emptyItem: T) => {
    setEditingIndex(-1);
    setDraft(emptyItem);
  }, []);

  // Cancel editing
  const cancel = useCallback(() => {
    setEditingIndex(null);
    setDraft(null);
  }, []);

  // Save current draft
  const save = useCallback((currentData: T[]) => {
    if (!draft) return;

    // Custom validation
    if (validateBeforeSave) {
      const result = validateBeforeSave(draft);
      if (result !== true) {
        toast.error(result, { duration: toastDuration });
        return;
      }
    }

    const isNew = editingIndex === -1;

    // Check for changes when editing
    if (!isNew && editingIndex !== null && diffFields) {
      const originalItem = currentData[editingIndex];
      const changes = diffFields(originalItem, draft);
      if (!changes.length) {
        toast("No changes detected", { 
          icon: "ℹ️",
          duration: toastDuration 
        });
        return;
      }
    }

    // Check required fields
    if (getMissingFields) {
      const missing = getMissingFields(draft);
      if (missing.length > 0) {
        const message = formatMissingFields(missing);
        toast(`Required Fields Missing: ${message}`, {
          icon: "⚠️",
          duration: toastDuration
        });
        if (!allowPartialSave) return;
      }
    }

    // Confirm if needed
    if (confirmSave) {
      const action = isNew ? "add" : "update";
      if (!window.confirm(`Are you sure you want to ${action} this item?`)) {
        return;
      }
    }

    // Update data
    const updatedData = isNew
      ? [...currentData, draft]
      : currentData.map((item, idx) => (idx === editingIndex ? draft : item));

    onSave(updatedData);
    setEditingIndex(null);
    setDraft(null);

    toast.success(isNew ? "Added Successfully!" : "Updated Successfully!", {
      duration: toastDuration
    });
  }, [
    draft,
    editingIndex,
    validateBeforeSave,
    diffFields,
    getMissingFields,
    allowPartialSave,
    confirmSave,
    toastDuration,
    onSave
  ]);

  return {
    editingIndex,
    draft,
    setDraft,
    startEdit,
    startAdd,
    cancel,
    save,
    isEditing: editingIndex !== null,
    isNew: editingIndex === -1,
  };
} 
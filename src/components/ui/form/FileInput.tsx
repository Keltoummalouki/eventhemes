'use client';

import { useRef, useState, type DragEvent } from 'react';
import { formText } from '@/data/ui';
import { cx } from '@/lib/cx';
import { acceptsFile } from '@/lib/files';
import Field, { useFieldIds, type FieldProps } from './Field';
import s from './controls.module.css';

export type FileInputProps = FieldProps & {
  /** Reçoit les fichiers choisis ou déposés, déjà filtrés par `accept`. */
  onFiles: (files: File[]) => void;
  /** Types acceptés, comme l'attribut natif : « image/jpeg,image/png », « .pdf »… */
  accept?: string;
  multiple?: boolean;
  /** Import en cours : le champ est bloqué et annonce son attente. */
  loading?: boolean;
  loadingText?: string;
  /** Texte du bouton. */
  buttonText?: string;
  /** Invitation affichée à côté du bouton. */
  placeholder?: string;
  id?: string;
  disabled?: boolean;
};

/**
 * Sélecteur de fichiers aux couleurs de la marque : bouton « Parcourir » en
 * français (le bouton natif suit la langue du navigateur), dépôt par
 * glisser-déposer, fichiers hors format écartés.
 *
 * Le champ ne garde pas la sélection : chaque choix est remis au parent, qui
 * l'importe ou l'affiche. Choisir deux fois le même fichier fonctionne donc.
 * Pour la même raison, `required` ne fait qu'afficher l'astérisque : c'est au
 * parent de vérifier qu'un fichier a été fourni.
 */
export default function FileInput({
  onFiles,
  accept,
  multiple,
  loading = false,
  loadingText = formText.uploading,
  buttonText = multiple ? formText.chooseFiles : formText.chooseFile,
  placeholder = multiple ? formText.dropFiles : formText.dropFile,
  id,
  disabled,
  label,
  hideLabel,
  hint,
  error,
  required,
  className,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(false);
  const locked = disabled || loading;
  const shownError = error || (rejected ? formText.fileRejected : undefined);
  const ids = useFieldIds(id, hint, shownError);

  function take(list: FileList | null) {
    const files = Array.from(list ?? []);
    const kept = files.filter((file) => acceptsFile(file, accept)).slice(0, multiple ? undefined : 1);
    setRejected(kept.length < files.length);
    if (kept.length) onFiles(kept);
  }

  function onDrag(event: DragEvent<HTMLDivElement>, over: boolean) {
    if (locked || !event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    setDragging(over);
  }

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={shownError}
      required={required}
      className={className}
      ids={ids}
      htmlFor={ids.control}
    >
      <div
        className={cx(s.control, s.file)}
        data-invalid={shownError ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-dragging={dragging ? '' : undefined}
        aria-busy={loading || undefined}
        onClick={() => {
          if (!locked) inputRef.current?.click();
        }}
        onDragEnter={(event) => onDrag(event, true)}
        onDragOver={(event) => onDrag(event, true)}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(event) => {
          if (locked) return;
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          id={ids.control}
          type="file"
          className="visually-hidden"
          accept={accept}
          multiple={multiple}
          disabled={locked}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={ids.describedBy}
          // Le clic vient déjà de la boîte : on évite qu'il remonte et rouvre la fenêtre.
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            take(event.target.files);
            // Vidé pour qu'un même fichier choisi à nouveau déclenche un changement.
            event.target.value = '';
          }}
        />
        <span className={s.fileButton} aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 15.5V4M7.5 8.5 12 4l4.5 4.5M4.5 14.5v5h15v-5" />
          </svg>
          {buttonText}
        </span>
        <span className={cx(s.value, s.placeholder, !loading && s.dropHint)}>
          {loading ? loadingText : placeholder}
        </span>
        <span className="visually-hidden" role="status">
          {loading ? loadingText : ''}
        </span>
      </div>
    </Field>
  );
}

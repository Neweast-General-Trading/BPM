import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { type BpmProcess, type ActivityItem } from 'src/sections/bpm/storage';
import {
  openActivityAttachment,
  deleteActivityAttachment,
  uploadActivityAttachments,
} from 'src/sections/bpm/api';

type Props = {
  departmentId: string;
  processId: string;
  activity: ActivityItem;
  canEdit: boolean;
  onUpdated: (next: BpmProcess) => void;
};

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

export function SubProcessAttachmentsCard({
  departmentId,
  processId,
  activity,
  canEdit,
  onUpdated,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const files = activity.attachments ?? [];

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await work();
    } catch (err) {
      setError((err as Error).message || 'Could not update attachments.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card variant="outlined" data-print-card sx={{ p: 2, bgcolor: '#FFF6F6', borderColor: '#E8C8C8' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Attachments
        </Typography>
        {canEdit ? (
          <Button
            data-print-hide
            size="small"
            variant="outlined"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={14} /> : <Iconify icon="mingcute:add-line" width={16} />}
            onClick={() => inputRef.current?.click()}
          >
            Upload files
          </Button>
        ) : null}
      </Stack>
      <input
        ref={inputRef}
        hidden
        multiple
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.csv,.zip"
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (!picked.length) return;
          void run(async () => {
            const next = await uploadActivityAttachments(departmentId, processId, activity.id, picked);
            onUpdated(next);
          });
        }}
      />
      {error ? (
        <Alert severity="error" sx={{ mb: 1 }} data-print-hide>
          {error}
        </Alert>
      ) : null}
      {files.length ? (
        <Stack spacing={0.75}>
          {files.map((file) => {
            const meta = [formatSize(file.fileSize), file.uploadedByName].filter(Boolean).join(' · ');
            return (
              <Stack key={file.id} direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:document-bold" width={16} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                    {file.originalName}
                  </Typography>
                  {meta ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {meta}
                    </Typography>
                  ) : null}
                </Box>
                <Button
                  data-print-hide
                  size="small"
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      openActivityAttachment(
                        departmentId,
                        processId,
                        activity.id,
                        file.id,
                        file.originalName,
                        'view',
                      ),
                    )
                  }
                >
                  View
                </Button>
                <Button
                  data-print-hide
                  size="small"
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      openActivityAttachment(
                        departmentId,
                        processId,
                        activity.id,
                        file.id,
                        file.originalName,
                        'download',
                      ),
                    )
                  }
                >
                  Download
                </Button>
                {canEdit ? (
                  <IconButton
                    data-print-hide
                    size="small"
                    color="error"
                    disabled={busy}
                    aria-label={`Remove ${file.originalName}`}
                    onClick={() => {
                      if (!window.confirm(`Remove "${file.originalName}" from this sub-process?`)) return;
                      void run(async () => {
                        const next = await deleteActivityAttachment(
                          departmentId,
                          processId,
                          activity.id,
                          file.id,
                        );
                        onUpdated(next);
                      });
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                ) : null}
              </Stack>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No files attached to this sub-process.
        </Typography>
      )}
    </Card>
  );
}

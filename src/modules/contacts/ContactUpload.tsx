import React, { useCallback, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { remoteRoutes } from '../../data/constants';
import { postFile } from '../../utils/ajax';

interface IProps {
  show: boolean;
  onClose: () => any;
  onDone: () => any;
}

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
  titleText: { fontSize: 16, fontWeight: 700, color: '#1f2025' },
  content: {
    padding: '24px 20px',
    minWidth: 420,
    [theme.breakpoints.down('xs')]: { minWidth: 'unset' },
  },

  dropZone: {
    border: '2px dashed rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: '36px 24px',
    textAlign: 'center' as any,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    background: '#fafafa',
    '&:hover': { borderColor: '#E72C6C', background: 'rgba(231,44,108,0.02)' },
  },
  dropZoneDragging: {
    borderColor: '#E72C6C',
    background: 'rgba(231,44,108,0.04)',
  },
  uploadIcon: { fontSize: 40, color: '#d1d5db', marginBottom: 10 },
  dropText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2025',
    marginBottom: 4,
  },
  dropSub: { fontSize: 12, color: '#9ca3af' },
  fileInput: { display: 'none' },

  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    background: 'rgba(231,44,108,0.05)',
    borderRadius: 10,
    border: '1px solid rgba(231,44,108,0.2)',
    marginTop: 12,
  },
  fileName: { fontSize: 13, fontWeight: 600, color: '#1f2025', flex: 1 },

  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderRadius: 10,
    marginTop: 16,
  },
  statusText: { fontSize: 13, fontWeight: 600 },

  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  sampleBtn: {
    fontSize: 12,
    textTransform: 'none' as any,
    color: '#6b7280',
    fontWeight: 600,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: '6px 14px',
  },
  cancelBtn: {
    fontSize: 12,
    textTransform: 'none' as any,
    color: '#6b7280',
    fontWeight: 600,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: '6px 14px',
  },
  uploadBtn: {
    fontSize: 13,
    textTransform: 'none' as any,
    fontWeight: 700,
    borderRadius: 8,
    padding: '8px 20px',
    background: 'linear-gradient(90deg, #E72C6C 0%, #fe8c45 100%)',
    color: '#fff',
    boxShadow: 'none',
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
    '&:disabled': { background: '#e0e0e0', color: '#9ca3af' },
  },
  doneBtn: {
    fontSize: 13,
    textTransform: 'none' as any,
    fontWeight: 700,
    borderRadius: 8,
    padding: '8px 20px',
    background: '#10b981',
    color: '#fff',
    boxShadow: 'none',
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
  },

  hint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 10,
    lineHeight: 1.6,
  },
}));

// CSV sample with correct column headers for the server's /api/students/import
const SAMPLE_CSV = [
  'firstName,lastName,email,phone,hub,course,gender,dateOfBirth,address',
  'John,Doe,john@example.com,+256700000001,katanga,website-development,Male,2000-01-15,"Kampala, Uganda"',
  'Jane,Smith,jane@example.com,+256700000002,kosovo,graphic-design,Female,2001-03-22,"Kigali, Rwanda"',
].join('\n');

const ContactUpload = ({ show, onClose, onDone }: IProps) => {
  const classes = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState(
    'Upload failed. Please check your file and try again.',
  );
  const [imported, setImported] = useState(0);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setLoading(false);
    setImported(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDone = () => {
    reset();
    onDone();
  };

  const pickFile = (f: File) => {
    if (!f.name.match(/\.(csv|xlsx|xls)$/i)) {
      setErrorMsg('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('idle');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) pickFile(f);
  };

  const handleUpload = () => {
    if (!file) return;
    setLoading(true);
    setStatus('idle');
    const formData = new FormData();
    formData.append('file', file);
    postFile(
      remoteRoutes.contactsPeopleUpload,
      formData,
      (res: any) => {
        setImported(res?.imported ?? res?.count ?? 0);
        setStatus('success');
      },
      (_: any, res: any) => {
        const msg =
          res?.body?.message ||
          res?.body?.error ||
          'Upload failed. Check your file format and try again.';
        setErrorMsg(msg);
        setStatus('error');
      },
      () => setLoading(false),
    );
  };

  const handleSampleDownload = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <span className={classes.titleText}>Import Students</span>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon style={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.content}>
        {/* Drop zone */}
        {status !== 'success' && (
          <>
            <input
              id="student-import-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className={classes.fileInput}
              onChange={onInputChange}
            />
            <label
              htmlFor="student-import-input"
              className={`${classes.dropZone} ${
                dragging ? classes.dropZoneDragging : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <CloudUploadIcon className={classes.uploadIcon} />
              <div className={classes.dropText}>
                {file
                  ? 'Click to change file'
                  : 'Drop your file here or click to browse'}
              </div>
              <div className={classes.dropSub}>Supports .csv, .xlsx, .xls</div>
            </label>

            {file && (
              <div className={classes.fileSelected}>
                <CloudUploadIcon
                  style={{ fontSize: 18, color: '#E72C6C', flexShrink: 0 }}
                />
                <span className={classes.fileName}>{file.name}</span>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            <Typography className={classes.hint}>
              Required columns:{' '}
              <strong>firstName, lastName, email, phone, hub, course</strong>
              <br />
              Hub values: katanga · kosovo · jinja · namayemba · lyantode
              <br />
              Course values: graphic-design · website-development ·
              film-photography · alx-course
            </Typography>
          </>
        )}

        {/* Status */}
        {status === 'success' && (
          <div
            className={classes.statusBox}
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <CheckCircleIcon
              style={{ color: '#10b981', fontSize: 28, flexShrink: 0 }}
            />
            <div>
              <div className={classes.statusText} style={{ color: '#10b981' }}>
                Import successful
                {imported > 0 ? ` — ${imported} students added` : ''}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                The student list has been updated.
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div
            className={classes.statusBox}
            style={{
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              marginTop: 12,
            }}
          >
            <ErrorIcon
              style={{ color: '#ef4444', fontSize: 24, flexShrink: 0 }}
            />
            <div className={classes.statusText} style={{ color: '#ef4444' }}>
              {errorMsg}
            </div>
          </div>
        )}

        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 16,
            }}
          >
            <CircularProgress size={18} style={{ color: '#E72C6C' }} />
            <Typography style={{ fontSize: 13, color: '#6b7280' }}>
              Uploading and processing…
            </Typography>
          </div>
        )}

        {/* Actions */}
        <div className={classes.actions}>
          <Button
            className={classes.sampleBtn}
            startIcon={<GetAppIcon style={{ fontSize: 15 }} />}
            onClick={handleSampleDownload}
          >
            Download Template
          </Button>

          <div style={{ display: 'flex', gap: 8 }}>
            {status !== 'success' && (
              <Button
                className={classes.cancelBtn}
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            {status === 'success' ? (
              <Button className={classes.doneBtn} onClick={handleDone}>
                Done
              </Button>
            ) : (
              <Button
                className={classes.uploadBtn}
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Uploading…' : 'Upload'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactUpload;

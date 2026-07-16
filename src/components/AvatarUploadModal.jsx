import { useState } from 'react';
import { profileApi } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function AvatarUploadModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleFileSelect(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    // Client-side size check before even attempting upload — catches an
    // oversized file instantly instead of making someone wait for a
    // network round-trip just to find out it was too big.
    if (selected.size > 800 * 1024) {
      setError('Image must be under 800KB. Try a smaller photo or compress it first.');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await profileApi.uploadAvatar(file);
      updateUser(result.user);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not upload — try a different image.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    setSubmitting(true);
    try {
      const result = await profileApi.removeAvatar();
      updateUser(result.user);
      onClose();
    } catch (err) {
      setError('Could not remove picture. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Profile picture</h2>

        {error && <div className="error-banner">{error}</div>}

        <div className="avatar-upload-preview">
          {preview ? (
            <img src={preview} alt="Preview" className="avatar-image avatar-image-large" />
          ) : (
            <Avatar user={user} size={80} />
          )}
        </div>

        <label htmlFor="avatar-input" className="avatar-upload-label">
          Choose a photo
        </label>
        <input
          id="avatar-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="avatar-upload-input"
        />
        <p className="hint">JPG, PNG, or WEBP. Under 800KB.</p>

        <div className="modal-actions">
          {user?.avatar_path && !preview && (
            <button onClick={handleRemove} className="secondary" disabled={submitting}>
              Remove current picture
            </button>
          )}
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={!file || submitting}>
            {submitting ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

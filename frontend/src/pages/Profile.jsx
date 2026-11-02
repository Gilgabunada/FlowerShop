import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotyf } from '../contexts/NotyContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const notyf = useNotyf();

  const [profile, setProfile] = useState({ firstName: '', lastName: '', mobileNo: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        mobileNo: user.mobileNo || '',
      });
    }
  }, [user]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    const { ok, data } = await api('/users/profile', {
      method: 'PATCH',
      body: { firstName: profile.firstName, lastName: profile.lastName, mobileNo: profile.mobileNo },
    });
    setProfileLoading(false);
    if (ok) {
      setProfileSuccess('Profile updated successfully!');
      notyf.success('✅ Profile updated successfully!');
      await refreshUser();
    } else {
      const errorMsg = data?.error?.message || data?.error || data?.message || 'Failed to update profile.';
      setProfileError(errorMsg);
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  async function handlePwSubmit(e) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmNew) {
      const msg = 'New passwords do not match.';
      setPwError(msg);
      notyf.error(`❌ ${msg}`);
      return;
    }
    if (pwForm.newPassword.length < 8) {
      const msg = 'New password must be at least 8 characters.';
      setPwError(msg);
      notyf.error(`❌ ${msg}`);
      return;
    }
    setPwLoading(true);
    const { ok, data } = await api('/users/update-password', {
      method: 'PATCH',
      body: { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword },
    });
    setPwLoading(false);
    if (ok) {
      setPwSuccess('Password changed successfully!');
      notyf.success('✅ Password changed successfully!');
      setPwForm({ oldPassword: '', newPassword: '', confirmNew: '' });
    } else {
      const errorMsg = data?.error?.message || data?.error || data?.message || 'Failed to change password.';
      setPwError(errorMsg);
      notyf.error(`❌ ${errorMsg}`);
    }
  }

  if (!user) return <Spinner />;

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your account information</p>

        <div className="profile-avatar card">
          <div className="avatar-circle">
            {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p className="text-muted">{user.email}</p>
            {user.isAdmin && <span className="badge badge-primary">Admin</span>}
          </div>
        </div>

        {/* Edit profile */}
        <div className="card profile-section">
          <h3>Edit Profile</h3>
          <div className="divider" />
          {profileError && <ErrorMessage message={profileError} />}
          {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
          <form onSubmit={handleProfileSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="form-control"
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="form-control"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                className="form-control"
                type="tel"
                value={profile.mobileNo}
                onChange={(e) => setProfile((p) => ({ ...p, mobileNo: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={user.email} disabled />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card profile-section">
          <h3>Change Password</h3>
          <div className="divider" />
          {pwError && <ErrorMessage message={pwError} />}
          {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
          <form onSubmit={handlePwSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="form-control"
                value={pwForm.oldPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={pwForm.confirmNew}
                onChange={(e) => setPwForm((f) => ({ ...f, confirmNew: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .profile-avatar { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; margin-bottom: 1.25rem; }
        .avatar-circle {
          width: 70px; height: 70px; border-radius: 50%;
          background: var(--primary); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; font-weight: 700; font-family: 'Playfair Display', serif;
          flex-shrink: 0;
        }
        .profile-avatar h2 { margin-bottom: 0.2rem; }
        .profile-section { padding: 1.5rem; margin-bottom: 1.25rem; }
        .profile-section h3 { color: var(--primary-dark); font-size: 1.1rem; margin-bottom: 0.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}

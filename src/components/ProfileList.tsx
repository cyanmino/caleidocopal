import type { ProfileRecord } from '../astro/types';

interface ProfileListProps {
  profiles: ProfileRecord[];
  currentId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProfileList({ profiles, currentId, onSelect, onDelete }: ProfileListProps) {
  return (
    <div className="profile-list">
      {profiles.map((profile) => (
        <div key={profile.id} className="profile-card">
          <strong>{profile.label}</strong>
          <span>
            {new Date(profile.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="secondary"
              onClick={() => onSelect(profile.id)}
              style={{ opacity: profile.id === currentId ? 1 : 0.75 }}
            >
              {profile.id === currentId ? 'Activo' : 'Cargar'}
            </button>
            <button type="button" className="secondary" onClick={() => onDelete(profile.id)}>
              Borrar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

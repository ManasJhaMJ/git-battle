// ProfileCard.jsx
const ProfileCard = ({ profile }) => {
    return (
      <div className="profile-card">
        <img className="avatar" src={profile.avatar_url} alt={`${profile.login}'s avatar`} />
        <h3>{profile.name || profile.login}</h3>
        <p className="username">{profile.login}</p>
        <p className="bio">{profile.bio || 'No bio available'}</p>
      </div>
    );
  };
  
  export default ProfileCard;
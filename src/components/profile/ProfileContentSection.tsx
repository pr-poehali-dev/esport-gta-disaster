import { Card } from '@/components/ui/card';
import ProfileInvitationsCard from '@/components/profile/ProfileInvitationsCard';
import ProfileTeamsCard from '@/components/profile/ProfileTeamsCard';

interface ProfileContentSectionProps {
  profile: any;
  userTeams?: any[];
}

export default function ProfileContentSection({ profile, userTeams = [] }: ProfileContentSectionProps) {
  return (
    <>
      <div className="mb-6">
        <ProfileTeamsCard teams={userTeams} />
      </div>

      {profile.bio && (
        <Card className="p-6 bg-card/50 mb-6">
          <h3 className="text-lg font-bold mb-3">О себе</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
        </Card>
      )}

      {profile.signature_url && (
        <Card className="p-6 bg-card/50 mb-6">
          <h3 className="text-lg font-bold mb-3">Подпись</h3>
          {profile.signature_url.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={profile.signature_url} controls className="w-full rounded-lg" />
          ) : (
            <img src={profile.signature_url} alt="Signature" className="w-full rounded-lg" />
          )}
        </Card>
      )}

      <ProfileInvitationsCard userId={profile.id} />
    </>
  );
}
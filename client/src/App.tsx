import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Jobs } from './pages/Jobs';
import { Communities } from './pages/Communities';
import { CommunityDetail } from './pages/CommunityDetail';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaticPage } from './pages/StaticPage';
import { Unauthorized } from './pages/Unauthorized';
import { TeamFormation } from './pages/TeamFormation';
import { DevQuests } from './pages/DevQuests';
import { DevQuestDetail } from './pages/DevQuestDetail';
import { DevQuestLeaderboard } from './pages/DevQuestLeaderboard';
import { HostEvent } from './pages/HostEvent';
import { MyCertificates } from './pages/MyCertificates';
import { JobApplications } from './pages/JobApplications';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { OrganizerLayout } from './pages/organizer/OrganizerLayout';
import { OrganizerOverview } from './pages/organizer/OrganizerOverview';
import { OrganizerParticipants } from './pages/organizer/OrganizerParticipants';
import { OrganizerCommunications } from './pages/organizer/OrganizerCommunications';
import { OrganizerCheckIn } from './pages/organizer/OrganizerCheckIn';
import { OrganizerCertificates } from './pages/organizer/OrganizerCertificates';
import { OrganizerProjects } from './pages/organizer/OrganizerProjects';
import { OrganizerInvite } from './pages/organizer/OrganizerInvite';
import { OrganizerEventMailer } from './pages/organizer/OrganizerEventMailer';
import { DevQuestHost } from './pages/DevQuestHost';
import { DevQuestAdmin } from './pages/DevQuestAdmin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="event/:eventName" element={<EventDetail />} />
            <Route path="event/:eventName/team-formation" element={<TeamFormation />} />
            <Route path="event/:eventName/team/:teamCode" element={<TeamFormation />} />
            <Route path="team-formation/:eventId" element={<TeamFormation />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="view/:jobId/applications" element={<JobApplications />} />
            <Route path="communities" element={<Communities />} />
            <Route path="community/:id" element={<CommunityDetail />} />
            <Route path="devquests" element={<DevQuests />} />
            <Route path="devquests/bounties" element={<DevQuests />} />
            <Route path="devquests/leaderboard" element={<DevQuestLeaderboard />} />
            <Route path="devquests/quest/:id" element={<DevQuestDetail />} />
            <Route path="devquests/host" element={<DevQuestHost />} />
            <Route path="devquests/admin" element={<DevQuestAdmin />} />
            <Route path="resources" element={<StaticPage title="Learning Resources" />} />
            <Route path="features" element={<StaticPage title="Features"><ul className="list-disc pl-5 space-y-2"><li>1-click hackathon registration</li><li>Team formation & job board</li><li>DevQuests XP & leaderboard</li><li>Organizer dashboards</li></ul></StaticPage>} />
            <Route path="how-it-works" element={<StaticPage title="How it works"><ol className="list-decimal pl-5 space-y-2"><li>Build your profile</li><li>Discover events</li><li>Register in one click</li><li>Form teams & submit projects</li></ol></StaticPage>} />
            <Route path="faq" element={<StaticPage title="FAQ"><p>See README and CLONE_STATUS.md for platform features and API coverage.</p></StaticPage>} />
            <Route path="our-team" element={<StaticPage title="Our Team" />} />
            <Route path="contact" element={<StaticPage title="Contact" />} />
            <Route path="services" element={<StaticPage title="Services" />} />
            <Route path="HostEvent" element={<HostEvent />} />
            <Route path="privacy-policy" element={<StaticPage title="Privacy Policy" />} />
            <Route path="terms-of-service" element={<StaticPage title="Terms of Service" />} />
            <Route path="cookie-policy" element={<StaticPage title="Cookie Policy" />} />
            <Route path="cancellations-refunds" element={<StaticPage title="Cancellations & Refunds" />} />
            <Route path="unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="registration" element={<StaticPage title="Registration" />} />
              <Route path="registrations" element={<Profile />} />
              <Route path="certificates" element={<MyCertificates />} />
            </Route>

            <Route element={<ProtectedRoute roles={['organizer', 'admin', 'superadmin', 'manager']} />}>
              <Route path="organizer" element={<OrganizerLayout />}>
                <Route index element={<OrganizerOverview />} />
                <Route path="participants" element={<OrganizerParticipants />} />
                <Route path="communications" element={<OrganizerCommunications />} />
                <Route path="checkin" element={<OrganizerCheckIn />} />
                <Route path="certificates" element={<OrganizerCertificates />} />
                <Route path="stats" element={<OrganizerOverview />} />
                <Route path="projects" element={<OrganizerProjects />} />
                <Route path="invite" element={<OrganizerInvite />} />
                <Route path="event-mailer" element={<OrganizerEventMailer />} />
              </Route>
              <Route path="manager" element={<ManagerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="superadmin/invites" element={<StaticPage title="Invites" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Mail, 
  Crown, 
  Edit, 
  Eye, 
  Trash2, 
  UserPlus,
  Settings,
  Activity,
  Folder,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const Teams = () => {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Demo data for non-authenticated users
  const demoTeams = [
    {
      id: 1,
      name: 'Demo Team',
      role: 'admin',
      member_count: 3,
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  const demoMembers = [
    {
      id: 1,
      user_id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      joined_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      user_id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'editor',
      status: 'active',
      joined_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      user_id: 3,
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'viewer',
      status: 'active',
      joined_at: '2024-01-03T00:00:00Z'
    }
  ];

  const demoInvitations = [
    {
      id: 1,
      email: 'newuser@example.com',
      role: 'editor',
      status: 'pending',
      invited_by: 'John Doe',
      created_at: '2024-01-15T10:00:00Z'
    }
  ];

  const demoActivities = [
    {
      id: 1,
      type: 'calculation',
      description: 'John Doe created a new calculation',
      user: 'John Doe',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'member',
      description: 'Jane Smith joined the team',
      user: 'Jane Smith',
      created_at: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      type: 'bulk',
      description: 'Bob Wilson uploaded a bulk file',
      user: 'Bob Wilson',
      created_at: '2024-01-15T08:45:00Z'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
    } else {
      // Use demo data for non-authenticated users
      setTeams(demoTeams);
      setCurrentTeam(demoTeams[0]);
      setMembers(demoMembers);
      setInvitations(demoInvitations);
      setActivities(demoActivities);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/v1/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
        if (data.teams.length > 0) {
          setCurrentTeam(data.teams[0]);
          fetchTeamDetails(data.teams[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const [membersRes, invitationsRes, activitiesRes] = await Promise.all([
        fetch(`/api/v1/teams/${teamId}/members`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/v1/teams/${teamId}/invitations`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/v1/teams/${teamId}/activities`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members);
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        setInvitations(invitationsData.invitations);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities);
      }
    } catch (error) {
      console.error('Failed to fetch team details:', error);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;

    if (!isAuthenticated) {
      // Demo mode
      const newTeam = {
        id: Date.now(),
        name: teamName,
        role: 'admin',
        member_count: 1,
        created_at: new Date().toISOString()
      };
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
      setShowCreateModal(false);
      setTeamName('');
      return;
    }

    try {
      const response = await fetch('/api/v1/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: teamName })
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(prev => [...prev, data.team]);
        setCurrentTeam(data.team);
        setShowCreateModal(false);
        setTeamName('');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeam) return;

    if (!isAuthenticated) {
      // Demo mode
      const newInvitation = {
        id: Date.now(),
        email: inviteEmail,
        role: inviteRole,
        status: 'pending',
        invited_by: 'You',
        created_at: new Date().toISOString()
      };
      setInvitations(prev => [...prev, newInvitation]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('viewer');
      return;
    }

    try {
      const response = await fetch(`/api/v1/teams/${currentTeam.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(prev => [...prev, data.invitation]);
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('viewer');
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    if (!isAuthenticated) {
      // Demo mode
      setMembers(prev => prev.filter(member => member.id !== memberId));
      return;
    }

    try {
      const response = await fetch(`/api/v1/teams/${currentTeam.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMembers(prev => prev.filter(member => member.id !== memberId));
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!isAuthenticated) {
      // Demo mode
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      return;
    }

    try {
      const response = await fetch(`/api/v1/teams/${currentTeam.id}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Team Workspace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Collaborate with your team on Small Package calculations and analysis
        </p>
      </div>

      {/* Demo mode banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode - Sample Team
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You're viewing a sample team workspace. Sign in to create your own team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentTeam ? currentTeam.name : 'Select a Team'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentTeam ? `${currentTeam.member_count} members` : 'No teams available'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </button>
        </div>
      </div>

      {currentTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Team Members
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-secondary flex items-center text-sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Invite
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => (
                  <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pending Invitations
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Invited by {invitation.invited_by} • {formatDate(invitation.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(invitation.role)}`}>
                          {invitation.role}
                        </span>
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Activity className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Create New Team
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="btn-primary"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Invite Team Member
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter email address"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="form-select w-full"
                >
                  <option value="viewer">Viewer - Can view calculations</option>
                  <option value="editor">Editor - Can create and edit calculations</option>
                  <option value="admin">Admin - Full team management</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  className="btn-primary"
                >
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
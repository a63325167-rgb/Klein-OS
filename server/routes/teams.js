const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { requirePlan } = require('../middleware/auth');
const { sendTeamInvitationEmail } = require('../utils/email');
const crypto = require('crypto');

const router = express.Router();

/**
 * Create a new team
 */
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Team name is required')
], requirePlan('pro'), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // Create team
    db.run(
      'INSERT INTO teams (name, owner_user_id) VALUES (?, ?)',
      [name.trim(), req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create team' });
        }

        const teamId = this.lastID;

        // Add creator as admin
        db.run(
          'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
          [teamId, req.user.id, 'admin'],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to add team member' });
            }

            res.status(201).json({
              message: 'Team created successfully',
              team: {
                id: teamId,
                name: name.trim(),
                owner_user_id: req.user.id,
                created_at: new Date().toISOString()
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

/**
 * Get user's teams
 */
router.get('/', requirePlan('pro'), (req, res) => {
  try {
    db.all(
      `SELECT t.*, tm.role 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = ? 
       ORDER BY t.created_at DESC`,
      [req.user.id],
      (err, teams) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ teams });
      }
    );
  } catch (error) {
    console.error('Teams fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/**
 * Get team details
 */
router.get('/:id', requirePlan('pro'), (req, res) => {
  try {
    const teamId = req.params.id;

    // Check if user is member of team
    db.get(
      `SELECT t.*, tm.role 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE t.id = ? AND tm.user_id = ?`,
      [teamId, req.user.id],
      (err, team) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!team) {
          return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ team });
      }
    );
  } catch (error) {
    console.error('Team fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

/**
 * Get team members
 */
router.get('/:id/members', requirePlan('pro'), (req, res) => {
  try {
    const teamId = req.params.id;

    // Check if user is member of team
    db.get(
      'SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!membership) {
          return res.status(404).json({ error: 'Team not found' });
        }

        // Get team members
        db.all(
          `SELECT u.id, u.email, u.name, tm.role, tm.created_at
           FROM team_members tm
           JOIN users u ON tm.user_id = u.id
           WHERE tm.team_id = ?
           ORDER BY tm.created_at ASC`,
          [teamId],
          (err, members) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            res.json({ members });
          }
        );
      }
    );
  } catch (error) {
    console.error('Team members fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

/**
 * Invite user to team
 */
router.post('/:id/invite', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], requirePlan('pro'), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const teamId = req.params.id;
    const { email } = req.body;

    // Check if user is admin of team
    db.get(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!membership || membership.role !== 'admin') {
          return res.status(403).json({ error: 'Only team admins can invite members' });
        }

        // Check if user is already a member
        db.get(
          'SELECT 1 FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ? AND u.email = ?',
          [teamId, email],
          (err, existingMember) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            if (existingMember) {
              return res.status(400).json({ error: 'User is already a team member' });
            }

            // Generate invitation token
            const inviteToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            // Create invitation
            db.run(
              'INSERT INTO invitations (team_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
              [teamId, email, inviteToken, expiresAt.toISOString()],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Failed to create invitation' });
                }

                // Get team name for email
                db.get('SELECT name FROM teams WHERE id = ?', [teamId], (err, team) => {
                  if (err) {
                    console.error('Failed to get team name:', err);
                    return res.status(500).json({ error: 'Failed to get team details' });
                  }

                  // Send invitation email
                  sendTeamInvitationEmail(email, team.name, inviteToken)
                    .then(() => {
                      res.json({
                        message: 'Invitation sent successfully',
                        invitation_id: this.lastID
                      });
                    })
                    .catch(error => {
                      console.error('Failed to send invitation email:', error);
                      res.status(500).json({ error: 'Failed to send invitation email' });
                    });
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Team invitation error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

/**
 * Accept team invitation
 */
router.post('/invite/accept', [
  body('token').notEmpty().withMessage('Invitation token is required')
], requirePlan('pro'), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    // Verify invitation token
    db.get(
      'SELECT * FROM invitations WHERE token = ? AND expires_at > ? AND accepted_at IS NULL',
      [token, new Date().toISOString()],
      (err, invitation) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!invitation) {
          return res.status(400).json({ error: 'Invalid or expired invitation' });
        }

        // Check if user email matches invitation email
        if (req.user.email !== invitation.email) {
          return res.status(400).json({ error: 'Invitation is for a different email address' });
        }

        // Add user to team
        db.run(
          'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
          [invitation.team_id, req.user.id, 'viewer'],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to join team' });
            }

            // Mark invitation as accepted
            db.run(
              'UPDATE invitations SET accepted_at = CURRENT_TIMESTAMP WHERE token = ?',
              [token],
              (err) => {
                if (err) {
                  console.error('Failed to mark invitation as accepted:', err);
                }

                res.json({ message: 'Successfully joined team' });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

/**
 * Update team member role
 */
router.put('/:id/members/:userId', [
  body('role').isIn(['admin', 'editor', 'viewer']).withMessage('Invalid role')
], requirePlan('pro'), (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const teamId = req.params.id;
    const userId = req.params.userId;
    const { role } = req.body;

    // Check if user is admin of team
    db.get(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!membership || membership.role !== 'admin') {
          return res.status(403).json({ error: 'Only team admins can change roles' });
        }

        // Update member role
        db.run(
          'UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?',
          [role, teamId, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: 'Team member not found' });
            }

            res.json({ message: 'Member role updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

/**
 * Remove team member
 */
router.delete('/:id/members/:userId', requirePlan('pro'), (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;

    // Check if user is admin of team
    db.get(
      'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!membership || membership.role !== 'admin') {
          return res.status(403).json({ error: 'Only team admins can remove members' });
        }

        // Don't allow removing the team owner
        db.get(
          'SELECT owner_user_id FROM teams WHERE id = ?',
          [teamId],
          (err, team) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            if (team.owner_user_id == userId) {
              return res.status(400).json({ error: 'Cannot remove team owner' });
            }

            // Remove member
            db.run(
              'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
              [teamId, userId],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                  return res.status(404).json({ error: 'Team member not found' });
                }

                res.json({ message: 'Member removed successfully' });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/**
 * Get team calculations
 */
router.get('/:id/calculations', requirePlan('pro'), (req, res) => {
  try {
    const teamId = req.params.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is member of team
    db.get(
      'SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id],
      (err, membership) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!membership) {
          return res.status(404).json({ error: 'Team not found' });
        }

        // Get team calculations
        db.all(
          `SELECT c.*, 
                  json_extract(c.input_json, '$.product_name') as product_name,
                  json_extract(c.input_json, '$.category') as category,
                  json_extract(c.input_json, '$.destination_country') as destination_country,
                  json_extract(c.output_json, '$.shipping.chosen') as shipping_type,
                  json_extract(c.output_json, '$.totals.net_profit') as net_profit,
                  json_extract(c.output_json, '$.totals.roi_percent') as roi_percent,
                  u.name as user_name
           FROM calculations c
           JOIN users u ON c.user_id = u.id
           WHERE c.team_id = ?
           ORDER BY c.created_at DESC
           LIMIT ? OFFSET ?`,
          [teamId, limit, offset],
          (err, calculations) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            const formattedCalculations = calculations.map(calc => ({
              id: calc.id,
              product_name: calc.product_name,
              category: calc.category,
              destination_country: calc.destination_country,
              shipping_type: calc.shipping_type,
              net_profit: parseFloat(calc.net_profit || 0),
              roi_percent: parseFloat(calc.roi_percent || 0),
              eligibility: calc.eligibility_boolean,
              user_name: calc.user_name,
              created_at: calc.created_at
            }));

            res.json({
              calculations: formattedCalculations,
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Team calculations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch team calculations' });
  }
});

module.exports = router;


import React, { useState, useEffect } from 'react';
import { User, Plus, Shield, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New User State
    const [newUser, setNewUser] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            const data = await response.json();
            
            if (data.success) {
                setUsers([data.data.user, ...users]);
                setIsModalOpen(false);
                setNewUser({ email: '', password: '' });
                toast.success('User created successfully');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user');
        }
    };

    return (
        <div id="tab-settings" className="settings-content fade-in">
            {/* Tab Navigation */}
            <div className="settings-tabs">
                <button 
                    className={`settings-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    Staff Management
                </button>
                <button 
                    className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General Settings
                </button>
            </div>

            {/* Content */}
            <div className="settings-panel">
                {activeTab === 'staff' && (
                    <div className="staff-management">
                        <div className="panel-header">
                            <div className="header-text">
                                <h3>Team Members</h3>
                                <p>Manage who has access to the admin dashboard.</p>
                            </div>
                            <button className="add-staff-btn" onClick={() => setIsModalOpen(true)}>
                                <Plus size={18} /> Add Member
                            </button>
                        </div>

                        {/* Staff List */}
                        <div className="staff-list-container">
                            <div className="staff-table-header">
                                <span>User</span>
                                <span>Role</span>
                                <span>Joined</span>
                                <span>Actions</span>
                            </div>
                            <div className="staff-list">
                                {isLoading ? (
                                    // Skeleton Loader
                                    [...Array(3)].map((_, index) => (
                                        <div key={`skeleton-${index}`} className="staff-row skeleton-row">
                                            <div className="staff-user-info">
                                                <div className="skeleton-avatar pulse"></div>
                                                <div className="skeleton-text pulse w-120"></div>
                                            </div>
                                            <div className="skeleton-text pulse w-60"></div>
                                            <div className="skeleton-text pulse w-80"></div>
                                            <div className="skeleton-action pulse"></div>
                                        </div>
                                    ))
                                ) : users.length === 0 ? (
                                    <div className="empty-state-staff">
                                        <p>No team members found.</p>
                                    </div>
                                ) : users.map((user) => (
                                    <div key={user._id} className="staff-row">
                                        <div className="staff-user-info">
                                            <div className="staff-avatar">
                                                <User size={20} />
                                            </div>
                                            <div className="staff-details">
                                                <span className="staff-email">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="staff-role">
                                            <span className="role-badge admin">
                                                <Shield size={12} /> {user.role}
                                            </span>
                                        </div>
                                        <div className="staff-date">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="staff-actions">
                                            <button className="action-btn-icon delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="general-settings">
                        <div className="empty-state">
                            <h3>Store Settings</h3>
                            <p>Store configuration features coming soon.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Team Member</h3>
                            <button onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={16} />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="colleague@lumiere.com"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Shield size={16} />
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="Set a temporary password"
                                        minLength={6}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;

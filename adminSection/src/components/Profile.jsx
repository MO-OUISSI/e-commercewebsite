import React from 'react';
import '../styles/Profile.css';

const Profile = () => {
    return (
        <div id="tab-profile" className="profile-content fade-in">
            <div className="profile-header">
                <h2 className="profile-title">Profile</h2>
                <p className="profile-subtitle">Manage your personal information</p>
            </div>

            <div className="profile-card">
                <div className="profile-banner"></div>

                <div className="profile-info-container">
                    <div className="profile-avatar-row">
                        <div className="avatar-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                                alt="Profile"
                                className="profile-img"
                            />
                        </div>
                        <div className="profile-names">
                            <h3 className="display-name">Isabella V.</h3>
                            <p className="job-title">Senior Administrator</p>
                        </div>
                        <button className="edit-photo-btn">Edit Photo</button>
                    </div>

                    <form className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" defaultValue="Isabella" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" defaultValue="V." className="form-input" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" defaultValue="isabella.admin@lumiere.com" className="form-input" />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="save-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

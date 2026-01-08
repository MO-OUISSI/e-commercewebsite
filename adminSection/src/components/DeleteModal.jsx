import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/DeleteModal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="delete-modal-card fade-in-up" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="modal-icon-container">
                    <div className="icon-bg">
                        <AlertTriangle size={32} className="warning-icon" />
                    </div>
                </div>

                <div className="modal-content">
                    <h3 className="modal-title">{title || 'Confirm Deletion'}</h3>
                    <p className="modal-description">
                        {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
                    </p>
                </div>

                <div className="modal-actions">
                    <button 
                        className="modal-btn-cancel" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button 
                        className="modal-btn-confirm" 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loader-small"></div>
                        ) : (
                            'Delete Item'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;

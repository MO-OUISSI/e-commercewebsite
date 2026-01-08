import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AnnouncementBar = () => {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/content/announcement`);
                const result = await response.json();
                if (result.success && result.data && result.data.isVisible) {
                    setConfig(result.data);
                } else {
                    setConfig(null); // Hide if not visible or fetch fails
                }
            } catch (error) {
                console.error('Error fetching announcement:', error);
            }
        };

        fetchContent();
    }, []);

    if (!config) return null;

    const styles = {
        bar: {
            backgroundColor: config.bgColor || '#000',
            color: config.textColor || '#fff',
            textAlign: 'center',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.3s ease'
        },
        link: {
            color: 'inherit',
            textDecoration: 'none'
        }
    };

    return (
        <div style={styles.bar}>
            {config.link ? (
                <Link to={config.link} style={styles.link}>
                    {config.text}
                </Link>
            ) : (
                <span>{config.text}</span>
            )}
        </div>
    );
};

export default AnnouncementBar;

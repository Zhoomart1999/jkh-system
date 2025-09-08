import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api"
import { Announcement } from '../../types';
import { MegaphoneIcon } from '../ui/Icons';

const AnnouncementBanner: React.FC = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const allAnnouncements = await api.getAnnouncements();
                const activeAnnouncement = allAnnouncements.find(a => a.isActive);

                if (activeAnnouncement) {
                    const dismissedId = localStorage.getItem('dismissedAnnouncementId');
                    if (dismissedId !== activeAnnouncement.id) {
                        setAnnouncement(activeAnnouncement);
                        setIsVisible(true);
                    }
                } else {
                    // No active announcements, so clear any dismissal state
                    localStorage.removeItem('dismissedAnnouncementId');
                }
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            }
        };

        fetchAnnouncement();
    }, []);

    const handleDismiss = () => {
        if (announcement) {
            localStorage.setItem('dismissedAnnouncementId', announcement.id);
        }
        setIsVisible(false);
    };

    if (!isVisible || !announcement) {
        return null;
    }

    return (
        <div className="relative bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
                <div className="pr-16 sm:text-center sm:px-16">
                    <p className="font-medium">
                        <span className="md:hidden">
                            <MegaphoneIcon className="inline-block w-5 h-5 mr-2" />
                            {announcement.title}
                        </span>
                        <span className="hidden md:inline">
                             <MegaphoneIcon className="inline-block w-5 h-5 mr-2" />
                            <span className="font-bold">{announcement.title}:</span> {announcement.content}
                        </span>
                    </p>
                </div>
                <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="flex p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <span className="sr-only">Dismiss</span>
                        <span className="text-lg">✕</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

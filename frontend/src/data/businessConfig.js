import { Instagram, Twitter, Facebook } from 'lucide-react';

export const businessConfig = {
    name: "Lumière",
    fullName: "Lumière Fashion House",
    description: "Redefining the modern silhouette with sustainable practices and timeless design.",
    contact: {
        email: "contact@lumiere.com",
        phone: "+33 1 23 45 67 89",
        address: "75001 Paris, France"
    },
    socials: [
        { name: "Instagram", icon: Instagram, url: "#" },
        { name: "Twitter", icon: Twitter, url: "#" },
        { name: "Facebook", icon: Facebook, url: "#" }
    ],
    footerLinks: [
        {
            title: "Shop",
            links: [
                { label: "New Arrivals", url: "#" },
                { label: "Best Sellers", url: "#" },
                { label: "Dresses", url: "#" },
                { label: "Outerwear", url: "#" },
                { label: "Gift Cards", url: "#" }
            ]
        },
        {
            title: "Company",
            links: [
                { label: "Our Story", url: "#" },
                { label: "Sustainability", url: "#" },
                { label: "Careers", url: "#" },
                { label: "Press", url: "#" }
            ]
        }
    ]
};

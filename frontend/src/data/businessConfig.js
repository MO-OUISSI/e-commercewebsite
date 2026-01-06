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
    categories: [
        { label: "Tops", slug: "tops" },
        { label: "T-Shirts", slug: "t-shirts" },
        { label: "Sweaters", slug: "sweaters" },
        { label: "Jeans", slug: "jeans" },
        { label: "Skirts", slug: "skirts" },
        { label: "Hoodies", slug: "hoodies" },
        { label: "Jackets", slug: "jackets" },
        { label: "Pants", slug: "pants" }
    ],
    footerLinks: [
        {
            title: "Shop",
            links: [
                { label: "Tops", url: "/collection/tops" },
                { label: "T-Shirts", url: "/collection/t-shirts" },
                { label: "Jeans", url: "/collection/jeans" },
                { label: "Jackets", url: "/collection/jackets" },
                { label: "Outerwear", url: "/collection/outerwear" }
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

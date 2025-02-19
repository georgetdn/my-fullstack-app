// src/api.js
import axios from 'axios';

const API_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "file://" + __dirname + "/backend";

export const fetchData = async () => {
    try {
        const response = await fetch(`${API_URL}/api/data`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

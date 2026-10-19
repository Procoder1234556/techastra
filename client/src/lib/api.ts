import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  skills?: string[];
  xp?: number;
};

export type Event = {
  _id: string;
  name: string;
  hackathon: string;
  eventName: string;
  subtitle?: string;
  theme?: string[];
  startDate?: string;
  endDate?: string;
  location?: string;
  organizationName?: string;
  live?: boolean | string;
  verified?: boolean;
  isFeatured?: boolean;
  prizePool?: string;
  teamSize?: string;
  eventType?: string;
  numberOfRegistrations?: number;
  hasRegistered?: boolean;
  paid?: boolean;
  price?: number;
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  workMode?: string;
  type?: string;
  skills?: string[];
  featured?: boolean;
  applyUrl?: string;
};

export type Community = {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  memberCount?: number;
};

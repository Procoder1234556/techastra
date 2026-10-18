export function formatUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    college: row.college,
    skills: row.skills || [],
    xp: row.xp,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatEvent(row, extra = {}) {
  if (!row) return null;
  const doc = row.doc || {};
  return {
    ...doc,
    _id: row.id,
    hackathon: row.hackathon,
    eventName: row.event_name,
    approvalStatus: row.approval_status,
    live: row.live,
    numberOfRegistrations: row.number_of_registrations,
    createdBy: row.created_by,
    organizers: row.organizers || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...extra,
  };
}

export function formatJob(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    workMode: row.work_mode,
    type: row.type,
    description: row.description,
    skills: row.skills || [],
    applyUrl: row.apply_url,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function formatCommunity(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    memberCount: row.member_count,
    coverImage: row.cover_image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

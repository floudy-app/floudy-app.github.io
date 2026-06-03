import { API_BASE, getAuthHeaders } from './apiConfig.js';

export const loginUser = async (username, password) =>
{
    const res = await fetch(`${API_BASE}/api/auth/login`, {
                                                             method: 'POST',
                                                             headers: { 'Content-Type': 'application/json' },
                                                             body: JSON.stringify({ username, password })
                                                          });

    if (!res.ok)
    {
        const msg = await res.text();
        throw new Error(msg);
    }

    return await res.json();
};

export const registerUser = async (username, email, password) =>
{
    const res = await fetch(`${API_BASE}/api/auth/register`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ username, email, password })
                                                             });

    if (!res.ok)
    {
        const msg = await res.text();
        throw new Error(msg);
    }

    return true;
};

export const checkUsername = async (username) =>
{
    const res = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    return data.exists;
};

export const getAdminUsers = async () =>
{
    const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
    const data = await res.json();
    return data.users;
};

export const renameUser = async (id, username, adminId, adminName) =>
{
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/rename?username=${encodeURIComponent(username)}`, { 
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
};

export const blockUser = async (id, adminId, adminName) =>
{
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/block`, { 
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
};

export const unblockUser = async (id, adminId, adminName) =>
{
    const res = await fetch(`${API_BASE}/api/admin/users/${id}/unblock`, { 
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
};

export const getSuspiciousUsers = async () =>
{
    const res = await fetch(`${API_BASE}/api/log/suspicious`, {
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
    const data = await res.json();
    return data.users;
};

export const checkRecovery = async (usernameOrEmail) =>
{
    const res = await fetch(`${API_BASE}/api/auth/recovery/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail })
    });
    if (!res.ok)
    {
        const msg = await res.text();
        throw new Error(msg);
    }
    return await res.json();
};

export const sendRecovery = async (usernameOrEmail) =>
{
    const res = await fetch(`${API_BASE}/api/auth/recovery/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail })
    });
    if (!res.ok)
    {
        const msg = await res.text();
        throw new Error(msg);
    }
    return await res.json();
};

export const validateRecoveryToken = async (token) =>
{
    const res = await fetch(`${API_BASE}/api/auth/recovery/validate?token=${encodeURIComponent(token)}`);
    if (!res.ok)
    {
        const err = new Error(await res.text());
        err.status = res.status;
        throw err;
    }
    return await res.json();
};

export const resetPassword = async (token, password) =>
{
    const res = await fetch(`${API_BASE}/api/auth/recovery/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
    });
    if (!res.ok)
    {
        const err = new Error(await res.text());
        err.status = res.status;
        throw err;
    }
    return await res.json();
};


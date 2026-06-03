import { API_BASE, getAuthHeaders } from './apiConfig.js';

export const deleteFile = async (id) => await fetch(`${API_BASE}/api/files/delete/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
});

export const renameFile = async (id, name) => await fetch(`${API_BASE}/api/files/rename/${id}?name=${name}`, { 
    method: "PUT",
    headers: getAuthHeaders()
});

export const sendFile = async (file) => 
{
    const form = new FormData();

    form.append("file", file.raw);
    form.append("metadata", JSON.stringify({ 
                                              id: file.id, 
                                              name: file.name,
                                              size: file.size,
                                              type: file.type,
                                              uploaded: file.uploaded,
                                           }));

    const res = await fetch(`${API_BASE}/api/files`, { 
        method: "POST", 
        body: form,
        headers: getAuthHeaders()
    });
    if (!res.ok)
    {
        throw new Error(await res.text());
    }
};

export const getFiles = async page_index =>
{
    return await fetch(`${API_BASE}/api/files/page/${page_index}`, {
        headers: getAuthHeaders()
    })
                .then(response => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(data => 
                {
                    return {
                              total_pages: data.total_pages,
                              files:       data.files.map(file => 
                                           {
                                                const byte_chars = atob(file.base64);
                                                const byte_nums = new Array(byte_chars.length);
                        
                                                for (let i = 0; i < byte_chars.length; i++) byte_nums[i] = byte_chars.charCodeAt(i);
                                                
                                                return { 
                                                            id: file.id,
                                                            name: file.name,
                                                            size: file.size,
                                                            type: file.type,
                                                            uploaded: file.uploaded,
                                                            raw: new File([new Uint8Array(byte_nums)], file.name, { type: file.type }) 
                                                        };
                                           })
                            };
                });
}

export const getRecentFiles = async (count = 10) =>
{
    return await fetch(`${API_BASE}/api/files/recent?count=${count}`, {
        headers: getAuthHeaders()
    })
                .then(response => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(data => 
                {
                    return {
                                files:  data.files.map(file => 
                                        {
                                            const byte_chars = atob(file.base64);
                                            const byte_nums = new Array(byte_chars.length);
                    
                                            for (let i = 0; i < byte_chars.length; i++) byte_nums[i] = byte_chars.charCodeAt(i);
                                            
                                            return { 
                                                        id: file.id,
                                                        name: file.name,
                                                        size: file.size,
                                                        type: file.type,
                                                        uploaded: file.uploaded,
                                                        raw: new File([new Uint8Array(byte_nums)], file.name, { type: file.type }) 
                                                    };
                                        })
                            };
                });
};

export const getTypeStats = async () =>
{
    return await fetch(`${API_BASE}/api/stats/type`, {
        headers: getAuthHeaders()
    })
                .then(response => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(entries => 
                {
                    return { entries: entries.entries.map(entry => { return { type: entry.type, count: entry.count }; }) };
                });
};

export const getUploadStats = async () =>
{
    return await fetch(`${API_BASE}/api/stats/upload`, {
        headers: getAuthHeaders()
    })
                .then(response => {
                    if (!response.ok) throw new Error(response.statusText);
                    return response.json();
                })
                .then(entries => 
                {
                    return { entries: entries.entries.map(entry => { return { date: entry.date, count: entry.count }; }) };
                });
};

export const logAction = async (user, action, description, extra = {}) =>
{
    await fetch(`${API_BASE}/api/log`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            userId: user.id,
            username: user.username,
            groupName: user.role === 'Admin' ? 'Admin' : 'User',
            action,
            description,
            ...extra
        })
    });
};
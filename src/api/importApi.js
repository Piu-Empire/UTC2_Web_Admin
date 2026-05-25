import client from './axiosClient';

export function uploadImport(entity, file, overwrite, onProgress) {
    if (overwrite === undefined) overwrite = false;

    var form = new FormData();
    form.append('file', file);
    form.append('overwrite', String(overwrite));

    return client.post('/admin/import/' + entity, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function(e) {
            if (onProgress && e.total) {
                onProgress(Math.round((e.loaded * 100) / e.total));
            }
        },
    }).then(function(res) {
        var data = res.data;
        return data && data.data ? data.data : data;
    });
}
import client from './axiosClient';

function buildFormData(file, overwrite) {
    var form = new FormData();
    form.append('file', file);
    form.append('overwrite', String(overwrite ?? false));
    return form;
}

function postImport(entity, file, overwrite, onProgress) {
    return client.post('/admin/import/' + entity, buildFormData(file, overwrite), {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function(e) {
            if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
    }).then(function(res) {
        var data = res.data;
        return data && data.data ? data.data : data;
    });
}

export function uploadImport(entity, file, overwrite, onProgress) {
    return postImport(entity, file, overwrite, onProgress);
}

export function uploadImportScholarships(file, overwrite, onProgress) {
    return postImport('scholarships', file, overwrite, onProgress);
}

export function uploadImportWarnings(file, overwrite, onProgress) {
    return postImport('warnings', file, overwrite, onProgress);
}
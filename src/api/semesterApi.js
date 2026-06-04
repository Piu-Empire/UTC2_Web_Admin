import client from './axiosClient';

export const semesterApi = {
    getList: () => client.get('/academic/semesters'),
};
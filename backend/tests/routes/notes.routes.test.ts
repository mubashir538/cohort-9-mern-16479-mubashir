import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import notesService from '../../src/services/notes.service';
import AppError from '../../src/utils/Errors';

const fakeUserId = '507f1f77bcf86cd799439011';
const validNoteId = '507f1f77bcf86cd799439099';
const validToken = jwt.sign(
    { userId: fakeUserId, email: 'sara@gmail.com' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
);

function withCookie(req: request.Test) {
    return req.set('Cookie', [`token=${validToken}`]);
}

describe('GET /api/notes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('rejects when there is no cookie', async () => {
        const res = await request(app).get('/api/notes');
        expect(res.status).to.equal(401);
    });

    it('returns the notes for the logged in user', async () => {
        sinon.stub(notesService, 'getAllNotes').resolves([{ _id: '1', title: 'Note 1' }] as any);

        const res = await withCookie(request(app).get('/api/notes'));

        expect(res.status).to.equal(200);
        expect(res.body.data.notes).to.have.length(1);
    });

    it('rejects a search term longer than 100 characters', async () => {
        const longSearch = 'a'.repeat(101);

        const res = await withCookie(request(app).get('/api/notes').query({ search: longSearch }));

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('VALIDATION_ERROR');
    });

    it('rejects a sort value that is not one of the allowed options', async () => {
        const res = await withCookie(request(app).get('/api/notes').query({ sort: 'banana' }));
        expect(res.status).to.equal(400);
    });

});

describe('POST /api/notes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('requires a title', async () => {
        const res = await withCookie(request(app).post('/api/notes').send({ content: 'no title here' }));
        expect(res.status).to.equal(400);
    });

    it('creates a note and returns 201', async () => {
        sinon.stub(notesService, 'createNote').resolves({ _id: '1', title: 'New note' } as any);

        const res = await withCookie(request(app).post('/api/notes').send({ title: 'New note' }));

        expect(res.status).to.equal(201);
        expect(res.body.data.note.title).to.equal('New note');
    });

    it('rejects a highlight color that is not a real hex code', async () => {
        const res = await withCookie(request(app).post('/api/notes').send({ title: 'x', highlightColor: 'notahex' }));
        expect(res.status).to.equal(400);
    });

    it('accepts a valid hex highlight color', async () => {
        sinon.stub(notesService, 'createNote').resolves({ _id: '1', title: 'x', highlightColor: '#fb5743' } as any);

        const res = await withCookie(request(app).post('/api/notes').send({ title: 'x', highlightColor: '#fb5743' }));

        expect(res.status).to.equal(201);
    });

});

describe('GET /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 404 when the note does not exist or is not yours', async () => {
        sinon.stub(notesService, 'getNotebyId').rejects(new AppError('Note not found', 404, 'NOTE_NOT_FOUND'));

        const res = await withCookie(request(app).get(`/api/notes/${validNoteId}`));

        expect(res.status).to.equal(404);
        expect(res.body.message.code).to.equal('NOTE_NOT_FOUND');
    });

    it('returns the note when it belongs to the user', async () => {
        sinon.stub(notesService, 'getNotebyId').resolves({ _id: validNoteId, title: 'x' } as any);

        const res = await withCookie(request(app).get(`/api/notes/${validNoteId}`));

        expect(res.status).to.equal(200);
    });

});

describe('PUT /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('rejects an empty update body', async () => {
        const res = await withCookie(request(app).put(`/api/notes/${validNoteId}`).send({}));
        expect(res.status).to.equal(400);
    });

    it('allows an update with only isPinned set', async () => {
        sinon.stub(notesService, 'updateNote').resolves({ _id: validNoteId, isPinned: true } as any);

        const res = await withCookie(request(app).put(`/api/notes/${validNoteId}`).send({ isPinned: true }));

        expect(res.status).to.equal(200);
        expect(res.body.data.note.isPinned).to.equal(true);
    });

    it('allows an update with only highlightColor set', async () => {
        sinon.stub(notesService, 'updateNote').resolves({ _id: validNoteId, highlightColor: '#fb5743' } as any);

        const res = await withCookie(request(app).put(`/api/notes/${validNoteId}`).send({ highlightColor: '#fb5743' }));

        expect(res.status).to.equal(200);
    });

});

describe('DELETE /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 200 on a successful delete', async () => {
        sinon.stub(notesService, 'deleteNote').resolves();

        const res = await withCookie(request(app).delete(`/api/notes/${validNoteId}`));

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
    });

    it('returns 404 when trying to delete a note that is not yours', async () => {
        sinon.stub(notesService, 'deleteNote').rejects(new AppError('Note not found', 404, 'NOTE_NOT_FOUND'));

        const res = await withCookie(request(app).delete(`/api/notes/${validNoteId}`));

        expect(res.status).to.equal(404);
    });

});
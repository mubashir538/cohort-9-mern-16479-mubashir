import { expect } from 'chai';
import sinon from 'sinon';
import request, { type Response } from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import notesService from '../../src/services/notes.service';
import AppError from '../../src/utils/Errors';
import { runAsync } from '../runAsync';

const fakeUserId = '507f1f77bcf86cd799439011';
const validNoteId = '507f1f77bcf86cd799439099';
const validToken = jwt.sign(
    { userId: fakeUserId, email: 'sara@gmail.com' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
);

interface StubNoteListItem {
    _id: string;
    title: string;
}

interface StubNoteDetail {
    _id: string;
    title: string;
    isPinned?: boolean;
    highlightColor?: string | null;
}

function withCookie(req: request.Test) {
    return req.set('Cookie', [`token=${validToken}`]);
}

describe('GET /api/notes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('rejects when there is no cookie', async () => {
        let res: Response;
        try {
            res = await runAsync(request(app).get('/api/notes'));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(401);
    });

    it('returns the notes for the logged in user', async () => {
        const stubNotes: StubNoteListItem[] = [{ _id: '1', title: 'Note 1' }];
        sinon.stub(notesService, 'getAllNotes').resolves(stubNotes as unknown as Awaited<ReturnType<typeof notesService.getAllNotes>>);

        let res: Response;
        try {
            res = await runAsync(withCookie(request(app).get('/api/notes')));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
        expect(res.body.data.notes).to.have.length(1);
    });

    it('rejects a search term longer than 100 characters', async () => {
        const longSearch = 'a'.repeat(101);

        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).get('/api/notes').query({ search: longSearch }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('VALIDATION_ERROR');
    });

    it('rejects a sort value that is not one of the allowed options', async () => {
        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).get('/api/notes').query({ sort: 'banana' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

});

describe('POST /api/notes', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('requires a title', async () => {
        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).post('/api/notes').send({ content: 'no title here' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

    it('creates a note and returns 201', async () => {
        const stubNote: StubNoteDetail = { _id: '1', title: 'New note' };
        sinon.stub(notesService, 'createNote').resolves(stubNote as unknown as Awaited<ReturnType<typeof notesService.createNote>>);

        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).post('/api/notes').send({ title: 'New note' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(201);
        expect(res.body.data.note.title).to.equal('New note');
    });

    it('rejects a highlight color that is not a real hex code', async () => {
        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).post('/api/notes').send({ title: 'x', highlightColor: 'notahex' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

    it('accepts a valid hex highlight color', async () => {
        const stubNote: StubNoteDetail = { _id: '1', title: 'x', highlightColor: '#fb5743' };
        sinon.stub(notesService, 'createNote').resolves(stubNote as unknown as Awaited<ReturnType<typeof notesService.createNote>>);

        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).post('/api/notes').send({ title: 'x', highlightColor: '#fb5743' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(201);
    });

});

describe('GET /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 404 when the note does not exist or is not yours', async () => {
        sinon.stub(notesService, 'getNotebyId').rejects(new AppError('Note not found', 404, 'NOTE_NOT_FOUND'));

        let res: Response;
        try {
            res = await runAsync(withCookie(request(app).get(`/api/notes/${validNoteId}`)));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(404);
        expect(res.body.message.code).to.equal('NOTE_NOT_FOUND');
    });

    it('returns the note when it belongs to the user', async () => {
        const stubNote: StubNoteDetail = { _id: validNoteId, title: 'x' };
        sinon.stub(notesService, 'getNotebyId').resolves(stubNote as unknown as Awaited<ReturnType<typeof notesService.getNotebyId>>);

        let res: Response;
        try {
            res = await runAsync(withCookie(request(app).get(`/api/notes/${validNoteId}`)));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
    });

});

describe('PUT /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('rejects an empty update body', async () => {
        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).put(`/api/notes/${validNoteId}`).send({}))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

    it('allows an update with only isPinned set', async () => {
        const stubNote: StubNoteDetail = { _id: validNoteId, title: 'x', isPinned: true };
        sinon.stub(notesService, 'updateNote').resolves(stubNote as unknown as Awaited<ReturnType<typeof notesService.updateNote>>);

        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).put(`/api/notes/${validNoteId}`).send({ isPinned: true }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
        expect(res.body.data.note.isPinned).to.equal(true);
    });

    it('allows an update with only highlightColor set', async () => {
        const stubNote: StubNoteDetail = { _id: validNoteId, title: 'x', highlightColor: '#fb5743' };
        sinon.stub(notesService, 'updateNote').resolves(stubNote as unknown as Awaited<ReturnType<typeof notesService.updateNote>>);

        let res: Response;
        try {
            res = await runAsync(
                withCookie(request(app).put(`/api/notes/${validNoteId}`).send({ highlightColor: '#fb5743' }))
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
    });

});

describe('DELETE /api/notes/:id', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 200 on a successful delete', async () => {
        sinon.stub(notesService, 'deleteNote').resolves();

        let res: Response;
        try {
            res = await runAsync(withCookie(request(app).delete(`/api/notes/${validNoteId}`)));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
        expect(res.body.success).to.be.true;
    });

    it('returns 404 when trying to delete a note that is not yours', async () => {
        sinon.stub(notesService, 'deleteNote').rejects(new AppError('Note not found', 404, 'NOTE_NOT_FOUND'));

        let res: Response;
        try {
            res = await runAsync(withCookie(request(app).delete(`/api/notes/${validNoteId}`)));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(404);
    });

});

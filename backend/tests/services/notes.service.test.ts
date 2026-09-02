import { expect } from 'chai';
import sinon from 'sinon';
import { Note } from '../../src/models';
import notesService from '../../src/services/notes.service';
import AppError from '../../src/utils/Errors';

describe('notesService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('createNote', () => {

        it('creates a note tied to the given user', async () => {
            const fakeNote = { _id: { toString: () => 'note-1' }, title: 'Groceries', userId: 'user-1' };
            const createStub = sinon.stub(Note, 'create').resolves(fakeNote as any);

            const note = await notesService.createNote('user-1', 'Groceries', 'milk, eggs');

            expect(note.title).to.equal('Groceries');
            expect(createStub.firstCall.args[0]).to.deep.include({ userId: 'user-1', title: 'Groceries', content: 'milk, eggs' });
        });

        it('bombs out with 500 NOTE_CREATE_FAILED if mongo throws', async () => {
            sinon.stub(Note, 'create').rejects(new Error('db down'));

            try {
                await notesService.createNote('user-1', 'x');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(500);
                expect((err as AppError).code).to.equal('NOTE_CREATE_FAILED');
            }
        });

    });

    describe('getAllNotes', () => {

        it('splits a camelCase search term into separate tokens across title and content', async () => {
            const sortStub = sinon.stub().resolves([]);
            const findStub = sinon.stub(Note, 'find').returns({ sort: sortStub } as any);

            await notesService.getAllNotes('user-1', { searchTerm: 'codingGuy' });

            const filterUsed = findStub.firstCall.args[0] as any;
            expect(filterUsed.userId).to.equal('user-1');
            expect(filterUsed.$or).to.have.length(4);
        });

        it('sorts pinned notes first no matter which sort option is picked', async () => {
            const sortStub = sinon.stub().resolves([]);
            sinon.stub(Note, 'find').returns({ sort: sortStub } as any);

            await notesService.getAllNotes('user-1', { sort: 'title_asc' });

            expect(sortStub.firstCall.args[0]).to.deep.equal({ isPinned: -1, title: 1 });
        });

        it('does not attach an $or filter when no search term is given', async () => {
            const sortStub = sinon.stub().resolves([]);
            const findStub = sinon.stub(Note, 'find').returns({ sort: sortStub } as any);

            await notesService.getAllNotes('user-1', {});

            expect(findStub.firstCall.args[0]).to.deep.equal({ userId: 'user-1' });
        });

    });

    describe('getNotebyId', () => {

        it('rejects a badly formatted id with 400 before touching the db', async () => {
            try {
                await notesService.getNotebyId('user-1', 'not-a-real-object-id');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(400);
                expect((err as AppError).code).to.equal('INVALID_NOTE_ID');
            }
        });

        it('throws 404 when the note does not exist or is not yours', async () => {
            sinon.stub(Note, 'findOne').resolves(null);

            try {
                await notesService.getNotebyId('user-1', '507f1f77bcf86cd799439011');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(404);
                expect((err as AppError).code).to.equal('NOTE_NOT_FOUND');
            }
        });

        it('returns the note when everything checks out', async () => {
            sinon.stub(Note, 'findOne').resolves({ _id: '507f1f77bcf86cd799439011', title: 'x' } as any);

            const note = await notesService.getNotebyId('user-1', '507f1f77bcf86cd799439011');
            expect(note.title).to.equal('x');
        });

    });

    describe('updateNote', () => {

        it('only changes the fields actually passed in', async () => {
            const fakeNote: any = {
                _id: '507f1f77bcf86cd799439011',
                title: 'Old',
                content: 'Old content',
                userId: 'user-1',
                save: sinon.stub().resolves(),
            };
            sinon.stub(Note, 'findOne').resolves(fakeNote);

            const updated = await notesService.updateNote('user-1', '507f1f77bcf86cd799439011', { title: 'New' });

            expect(updated.title).to.equal('New');
            expect(updated.content).to.equal('Old content');
            expect(fakeNote.save.called).to.be.true;
        });

        it('returns 500 NOTE_UPDATE_FAILED if save blows up', async () => {
            const fakeNote: any = {
                _id: '507f1f77bcf86cd799439011',
                title: 'Old',
                userId: 'user-1',
                save: sinon.stub().rejects(new Error('nope')),
            };
            sinon.stub(Note, 'findOne').resolves(fakeNote);

            try {
                await notesService.updateNote('user-1', '507f1f77bcf86cd799439011', { title: 'New' });
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).code).to.equal('NOTE_UPDATE_FAILED');
            }
        });

        it('bubbles up the 404 from getNotebyId when the note is not yours', async () => {
            sinon.stub(Note, 'findOne').resolves(null);

            try {
                await notesService.updateNote('user-2', '507f1f77bcf86cd799439011', { title: 'Hacked' });
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(404);
            }
        });

    });

    describe('deleteNote', () => {

        it('deletes the note when it belongs to the user', async () => {
            const fakeNote: any = { _id: '507f1f77bcf86cd799439011', userId: 'user-1', deleteOne: sinon.stub().resolves() };
            sinon.stub(Note, 'findOne').resolves(fakeNote);

            await notesService.deleteNote('user-1', '507f1f77bcf86cd799439011');

            expect(fakeNote.deleteOne.called).to.be.true;
        });

        it('returns 500 NOTE_DELETE_FAILED if deleteOne blows up', async () => {
            const fakeNote: any = { _id: '507f1f77bcf86cd799439011', userId: 'user-1', deleteOne: sinon.stub().rejects(new Error('nope')) };
            sinon.stub(Note, 'findOne').resolves(fakeNote);

            try {
                await notesService.deleteNote('user-1', '507f1f77bcf86cd799439011');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).code).to.equal('NOTE_DELETE_FAILED');
            }
        });

        it('bubbles up the 404 from getNotebyId when deleting someone else\'s note', async () => {
            sinon.stub(Note, 'findOne').resolves(null);

            try {
                await notesService.deleteNote('user-2', '507f1f77bcf86cd799439011');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(404);
            }
        });

    });

});
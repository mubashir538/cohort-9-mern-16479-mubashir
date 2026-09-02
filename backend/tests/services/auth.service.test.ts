import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models';
import authService from '../../src/services/auth.service';
import AppError from '../../src/utils/Errors';

describe('authService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('signup', () => {

        it('creates a new user and returns a token when email is free', async () => {
            sinon.stub(User, 'findOne').resolves(null);
            sinon.stub(bcrypt, 'hash').resolves('hashed123' as never);

            const fakeUser = {
                _id: { toString: () => 'user-1' },
                name: 'Sara',
                email: 'sara@gmail.com',
            };
            sinon.stub(User, 'create').resolves(fakeUser as any);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            const res = await authService.signup('Sara', 'sara@gmail.com', 'password123');

            expect(res.token).to.equal('jwt-token');
            expect(res.user.email).to.equal('sara@gmail.com');
            expect(res.user).to.not.have.property('passwordHashed');
            expect((bcrypt.hash as sinon.SinonStub).firstCall.args[1]).to.equal(12);
        });

        it('throws USER_ALREADY_EXISTS if email is taken', async () => {
            sinon.stub(User, 'findOne').resolves({ _id: 'x', email: 'taken@gmail.com' } as any);

            try {
                await authService.signup('Someone', 'taken@gmail.com', 'password123');
                expect.fail('should have thrown');
            } catch (err) {
                const e = err as AppError;
                expect(e.statusCode).to.equal(400);
                expect(e.code).to.equal('USER_ALREADY_EXISTS');
            }
        });

    });

    describe('login', () => {

        it('logs in and returns a token when password matches', async () => {
            const fakeUser = {
                _id: { toString: () => 'user-1' },
                name: 'Sara',
                email: 'sara@gmail.com',
                passwordHashed: 'stored-hash',
            };
            sinon.stub(User, 'findOne').resolves(fakeUser as any);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(12);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            const res = await authService.login('sara@gmail.com', 'password123');
            expect(res.token).to.equal('jwt-token');
        });

        it('rejects when there is no user with that email', async () => {
            sinon.stub(User, 'findOne').resolves(null);

            try {
                await authService.login('nouser@gmail.com', 'whatever');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).code).to.equal('INVALID_CREDENTIALS');
                expect((err as AppError).statusCode).to.equal(401);
            }
        });

        it('rejects when the password does not match', async () => {
            const fakeUser = { _id: { toString: () => 'x' }, email: 'sara@gmail.com', passwordHashed: 'hash' };
            sinon.stub(User, 'findOne').resolves(fakeUser as any);
            sinon.stub(bcrypt, 'compare').resolves(false as never);

            try {
                await authService.login('sara@gmail.com', 'wrongpass');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).code).to.equal('INVALID_CREDENTIALS');
            }
        });

        it('gives the same error whether the user is missing or the password is wrong', async () => {
            sinon.stub(User, 'findOne').resolves(null);
            let msg1 = '';
            try { await authService.login('ghost@gmail.com', 'x'); } catch (e) { msg1 = (e as AppError).message; }

            sinon.restore();
            sinon.stub(User, 'findOne').resolves({ _id: { toString: () => 'x' }, email: 'sara@gmail.com', passwordHashed: 'h' } as any);
            sinon.stub(bcrypt, 'compare').resolves(false as never);
            let msg2 = '';
            try { await authService.login('sara@gmail.com', 'wrong'); } catch (e) { msg2 = (e as AppError).message; }

            expect(msg1).to.equal(msg2);
        });

        it('upgrades an old weak-cost hash after a successful login', async () => {
            const fakeUser: any = {
                _id: { toString: () => 'user-1' },
                email: 'sara@gmail.com',
                passwordHashed: 'weak-hash',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(3);
            sinon.stub(bcrypt, 'hash').resolves('new-hash' as never);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            await authService.login('sara@gmail.com', 'password123');

            expect(fakeUser.passwordHashed).to.equal('new-hash');
            expect(fakeUser.save.called).to.be.true;
        });

        it('does not touch the hash if it is already strong enough', async () => {
            const fakeUser: any = {
                _id: { toString: () => 'user-1' },
                email: 'sara@gmail.com',
                passwordHashed: 'already-strong',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(12);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            await authService.login('sara@gmail.com', 'password123');
            expect(fakeUser.save.called).to.be.false;
        });

    });

    describe('getUserById', () => {

        it('returns the user without passwordHashed', async () => {
            sinon.stub(User, 'findById').returns({
                select: sinon.stub().resolves({ _id: 'user-1', name: 'Sara', email: 'sara@gmail.com' }),
            } as any);

            const user = await authService.getUserById('user-1');
            expect(user.email).to.equal('sara@gmail.com');
        });

        it('throws USER_NOT_FOUND when nothing matches the id', async () => {
            sinon.stub(User, 'findById').returns({
                select: sinon.stub().resolves(null),
            } as any);

            try {
                await authService.getUserById('missing');
                expect.fail('should have thrown');
            } catch (err) {
                expect((err as AppError).statusCode).to.equal(404);
                expect((err as AppError).code).to.equal('USER_NOT_FOUND');
            }
        });

    });

});
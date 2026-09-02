import { expect } from 'chai';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models';
import authService from '../../src/services/auth.service';
import AppError from '../../src/utils/Errors';
import { runAsync } from '../runAsync';

interface FakeObjectId {
    toString(): string;
}

interface FakeCreatedUser {
    _id: FakeObjectId;
    name: string;
    email: string;
}

interface FakeExistingUser {
    _id: string;
    email: string;
}

interface FakeLoginUser {
    _id: FakeObjectId;
    name?: string;
    email: string;
    passwordHashed: string;
    save: sinon.SinonStub;
}

interface FakeUserWithoutPassword {
    _id: string;
    name: string;
    email: string;
}

interface FakeFindByIdQuery {
    select: sinon.SinonStub;
}

describe('authService', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('signup', () => {

        it('creates a new user and returns a token when email is free', async () => {
            sinon.stub(User, 'findOne').resolves(null);
            sinon.stub(bcrypt, 'hash').resolves('hashed123' as never);

            const fakeUser: FakeCreatedUser = {
                _id: { toString: () => 'user-1' },
                name: 'Sara',
                email: 'sara@gmail.com',
            };
            sinon.stub(User, 'create').resolves(fakeUser as unknown as Awaited<ReturnType<typeof User.create>>);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            let res;
            try {
                res = await runAsync(authService.signup('Sara', 'sara@gmail.com', 'password123'));
            } catch (err) {
                throw err;
            }

            expect(res.token).to.equal('jwt-token');
            expect(res.user.email).to.equal('sara@gmail.com');
            expect(res.user).to.not.have.property('passwordHashed');
            expect((bcrypt.hash as sinon.SinonStub).firstCall.args[1]).to.equal(12);
        });

        it('throws USER_ALREADY_EXISTS if email is taken', async () => {
            const takenUser: FakeExistingUser = { _id: 'x', email: 'taken@gmail.com' };
            sinon.stub(User, 'findOne').resolves(takenUser as unknown as Awaited<ReturnType<typeof User.findOne>>);

            try {
                await authService.signup('Someone', 'taken@gmail.com', 'password123');
                expect.fail('should have thrown');
            } catch (err) {
                if (!(err instanceof AppError)) {
                    throw err;
                }
                expect(err.statusCode).to.equal(400);
                expect(err.code).to.equal('USER_ALREADY_EXISTS');
            }
        });

    });

    describe('login', () => {

        it('logs in and returns a token when password matches', async () => {
            const fakeUser: FakeLoginUser = {
                _id: { toString: () => 'user-1' },
                name: 'Sara',
                email: 'sara@gmail.com',
                passwordHashed: 'stored-hash',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser as unknown as Awaited<ReturnType<typeof User.findOne>>);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(12);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            let res;
            try {
                res = await runAsync(authService.login('sara@gmail.com', 'password123'));
            } catch (err) {
                throw err;
            }

            expect(res.token).to.equal('jwt-token');
        });

        it('rejects when there is no user with that email', async () => {
            sinon.stub(User, 'findOne').resolves(null);

            try {
                await authService.login('nouser@gmail.com', 'whatever');
                expect.fail('should have thrown');
            } catch (err) {
                if (!(err instanceof AppError)) {
                    throw err;
                }
                expect(err.code).to.equal('INVALID_CREDENTIALS');
                expect(err.statusCode).to.equal(401);
            }
        });

        it('rejects when the password does not match', async () => {
            const fakeUser: FakeLoginUser = {
                _id: { toString: () => 'x' },
                email: 'sara@gmail.com',
                passwordHashed: 'hash',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser as unknown as Awaited<ReturnType<typeof User.findOne>>);
            sinon.stub(bcrypt, 'compare').resolves(false as never);

            try {
                await authService.login('sara@gmail.com', 'wrongpass');
                expect.fail('should have thrown');
            } catch (err) {
                if (!(err instanceof AppError)) {
                    throw err;
                }
                expect(err.code).to.equal('INVALID_CREDENTIALS');
            }
        });

        it('gives the same error whether the user is missing or the password is wrong', async () => {
            sinon.stub(User, 'findOne').resolves(null);
            let msg1 = '';
            try {
                await authService.login('ghost@gmail.com', 'x');
            } catch (e) {
                if (!(e instanceof AppError)) {
                    throw e;
                }
                msg1 = e.message;
            }

            sinon.restore();
            const wrongPassUser: FakeLoginUser = {
                _id: { toString: () => 'x' },
                email: 'sara@gmail.com',
                passwordHashed: 'h',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(wrongPassUser as unknown as Awaited<ReturnType<typeof User.findOne>>);
            sinon.stub(bcrypt, 'compare').resolves(false as never);
            let msg2 = '';
            try {
                await authService.login('sara@gmail.com', 'wrong');
            } catch (e) {
                if (!(e instanceof AppError)) {
                    throw e;
                }
                msg2 = e.message;
            }

            expect(msg1).to.equal(msg2);
        });

        it('upgrades an old weak-cost hash after a successful login', async () => {
            const fakeUser: FakeLoginUser = {
                _id: { toString: () => 'user-1' },
                email: 'sara@gmail.com',
                passwordHashed: 'weak-hash',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser as unknown as Awaited<ReturnType<typeof User.findOne>>);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(3);
            sinon.stub(bcrypt, 'hash').resolves('new-hash' as never);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            try {
                await runAsync(authService.login('sara@gmail.com', 'password123'));
            } catch (err) {
                throw err;
            }

            expect(fakeUser.passwordHashed).to.equal('new-hash');
            expect(fakeUser.save.called).to.be.true;
        });

        it('does not touch the hash if it is already strong enough', async () => {
            const fakeUser: FakeLoginUser = {
                _id: { toString: () => 'user-1' },
                email: 'sara@gmail.com',
                passwordHashed: 'already-strong',
                save: sinon.stub().resolves(),
            };
            sinon.stub(User, 'findOne').resolves(fakeUser as unknown as Awaited<ReturnType<typeof User.findOne>>);
            sinon.stub(bcrypt, 'compare').resolves(true as never);
            sinon.stub(bcrypt, 'getRounds').returns(12);
            sinon.stub(jwt, 'sign').returns('jwt-token' as never);

            try {
                await runAsync(authService.login('sara@gmail.com', 'password123'));
            } catch (err) {
                throw err;
            }

            expect(fakeUser.save.called).to.be.false;
        });

    });

    describe('getUserById', () => {

        it('returns the user without passwordHashed', async () => {
            const safeUser: FakeUserWithoutPassword = {
                _id: 'user-1',
                name: 'Sara',
                email: 'sara@gmail.com',
            };
            const selectStub = sinon.stub().resolves(safeUser);
            const findByIdQuery: FakeFindByIdQuery = { select: selectStub };
            sinon.stub(User, 'findById').returns(findByIdQuery as unknown as ReturnType<typeof User.findById>);

            let user;
            try {
                user = await runAsync(authService.getUserById('user-1'));
            } catch (err) {
                throw err;
            }

            expect(selectStub.firstCall.args[0]).to.equal('-passwordHashed');
            expect(user.email).to.equal('sara@gmail.com');
            expect(user).to.not.have.property('passwordHashed');
        });

        it('throws USER_NOT_FOUND when nothing matches the id', async () => {
            const selectStub = sinon.stub().resolves(null);
            const findByIdQuery: FakeFindByIdQuery = { select: selectStub };
            sinon.stub(User, 'findById').returns(findByIdQuery as unknown as ReturnType<typeof User.findById>);

            try {
                await authService.getUserById('missing');
                expect.fail('should have thrown');
            } catch (err) {
                if (!(err instanceof AppError)) {
                    throw err;
                }
                expect(err.statusCode).to.equal(404);
                expect(err.code).to.equal('USER_NOT_FOUND');
            }
        });

    });

});

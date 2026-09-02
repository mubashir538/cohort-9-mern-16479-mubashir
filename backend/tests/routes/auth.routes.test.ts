import { expect } from 'chai';
import sinon from 'sinon';
import request, { type Response } from 'supertest';
import app from '../../src/app';
import authService from '../../src/services/auth.service';
import AppError from '../../src/utils/Errors';
import { runAsync } from '../runAsync';

interface AuthStubResult {
    token: string;
    user: { id: string; name: string; email: string };
}

describe('POST /api/auth/signup', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 201 and sets an httpOnly cookie on success', async () => {
        const stubResult: AuthStubResult = {
            token: 'jwt-token',
            user: { id: '1', name: 'Sara', email: 'sara@gmail.com' },
        };
        sinon.stub(authService, 'signup').resolves(stubResult);

        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/signup')
                    .send({ name: 'Sara', email: 'sara@gmail.com', password: 'password123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(201);
        expect(res.body.data.user.email).to.equal('sara@gmail.com');
        expect(res.body.data).to.not.have.property('token');
        expect(res.headers['set-cookie'][0]).to.include('token=');
        expect(res.headers['set-cookie'][0]).to.include('HttpOnly');
    });

    it('returns 400 when the password is too short', async () => {
        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/signup')
                    .send({ name: 'Sara', email: 'sara@gmail.com', password: '123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('VALIDATION_ERROR');
    });

    it('returns 400 when the email is not a real email', async () => {
        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/signup')
                    .send({ name: 'Sara', email: 'not-an-email', password: 'password123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

    it('returns 400 when the service says the email is already taken', async () => {
        sinon.stub(authService, 'signup').rejects(new AppError('User with this email already exists', 400, 'USER_ALREADY_EXISTS'));

        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/signup')
                    .send({ name: 'Sara', email: 'sara@gmail.com', password: 'password123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('USER_ALREADY_EXISTS');
    });

});

describe('POST /api/auth/login', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 200 and sets a cookie on valid login', async () => {
        const stubResult: AuthStubResult = {
            token: 'jwt-token',
            user: { id: '1', name: 'Sara', email: 'sara@gmail.com' },
        };
        sinon.stub(authService, 'login').resolves(stubResult);

        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/login')
                    .send({ email: 'sara@gmail.com', password: 'password123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
        expect(res.headers['set-cookie'][0]).to.include('token=');
    });

    it('returns 401 when the credentials are wrong', async () => {
        sinon.stub(authService, 'login').rejects(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/login')
                    .send({ email: 'sara@gmail.com', password: 'wrongpass' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('INVALID_CREDENTIALS');
    });

    it('returns 400 when email is missing entirely', async () => {
        let res: Response;
        try {
            res = await runAsync(
                request(app)
                    .post('/api/auth/login')
                    .send({ password: 'password123' })
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(400);
    });

});

describe('POST /api/auth/logout', () => {

    it('clears the cookie and returns 200', async () => {
        let res: Response;
        try {
            res = await runAsync(request(app).post('/api/auth/logout'));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(200);
        expect(res.headers['set-cookie'][0]).to.include('token=;');
    });

});

describe('GET /api/auth/me', () => {

    it('returns 401 with NO_TOKEN_PROVIDED when there is no cookie', async () => {
        let res: Response;
        try {
            res = await runAsync(request(app).get('/api/auth/me'));
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('NO_TOKEN_PROVIDED');
    });

    it('returns 401 with INVALID_TOKEN when the cookie is garbage', async () => {
        let res: Response;
        try {
            res = await runAsync(
                request(app).get('/api/auth/me').set('Cookie', ['token=not-a-real-token'])
            );
        } catch (err) {
            throw err;
        }

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('INVALID_TOKEN');
    });

});
